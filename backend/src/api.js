import got from 'got';
import crypto from 'crypto';
import URL from 'url';
import _ from 'lodash';
import mongoose from 'mongoose';

import logger from './logger';
import { twitchGet } from './twitchAPI';
import settings from './settings';
import { generateToken } from './auth';
import { models } from './models';

export async function handleLogin(req, res, next) {
  const redirectUrl = req.query.state || settings.frontend.baseurl;
  const parsedRedirectUrl = URL.parse(redirectUrl);
  const domainFilter = new RegExp(settings.auth.domainFilter);
  if (!domainFilter.test(parsedRedirectUrl.hostname)) {
    res.status(403).end('Invalid redirect URL!');
    return;
  }
  try {
    logger.debug('Logging in...');
    const tokenResponse = await got.post('https://api.twitch.tv/kraken/oauth2/token', {
      form: true,
      body: {
        client_id: settings.twitch.clientID,
        client_secret: settings.twitch.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: `${settings.api.baseurl}login`,
        code: req.query.code,
        state: req.query.state
      },
      json: true
    });
    const token = tokenResponse.body.access_token;
    console.log('Token:', token);
    const userResponse = (await twitchGet('https://api.twitch.tv/kraken/user', null, token)).body;
    console.log('User response:', userResponse);
    if (userResponse) {
      // get user
      let user = await models.User.findOne({ 'connections.twitch.id': userResponse._id }).exec();
      if (!user) {
        user = new models.User({
          connections: {
            twitch:
            {
              name: userResponse.name,
              displayName: userResponse.display_name,
              id: userResponse._id,
              logo: userResponse.logo,
              email: userResponse.email,
              oauthToken: token,
              refreshToken: tokenResponse.body.refresh_token,
              expiresAt: Date.now() + tokenResponse.body.expires_in * 1000
            }
          },
          flag: (req.header['CF-IPCountry'] || 'XX').toLowerCase()
        });
        console.log('Created new user', user);
      } else {
        if (user.connections.twitch.name !== userResponse.name) {
          user.connections.twitch.name = userResponse.name;
          logger.info(`User ${user.connections.twitch.name} (id: ${userResponse._id}) changed their name to ${userResponse.name}`);
        }
        user.connections.twitch.displayName = userResponse.display_name;
        user.connections.twitch.logo = userResponse.logo;
        if (user.connections.twitch.email !== userResponse.email) {
          user.connections.twitch.email = userResponse.email;
          logger.info(`User ${user.connections.twitch.name} (id: ${userResponse._id}) changed their email to ${userResponse.email}`);
        }
        user.connections.twitch.oauthToken = token;
        user.connections.twitch.refreshToken = tokenResponse.body.refresh_token;
        user.connections.twitch.expiresAt = Date.now() + tokenResponse.body.expires_in * 1000;
        console.log('Updated user', user);
      }

      console.log('Default Admins:', settings.defaultAdmins);
      if (settings.defaultAdmins.includes(userResponse._id) && user.roles.length === 0) {
        const adminRole = await models.Role.findOne({ permissions: '*' }).exec();
        if (adminRole) {
          logger.info('Making user', user, 'an admin!');
          user.roles.push({
            event: null,
            role: adminRole
          });
        } else {
          logger.error('Tried to make', user, 'an admin, but no admin role exists!');
        }
      }

      await user.save();

      const jwt = generateToken(token, { twitchID: userResponse._id, name: user.name, id: user._id });
      res.cookie('esa-jwt', jwt, settings.auth.cookieOptions);

      console.log('Redirecting to', redirectUrl);
      res.redirect(redirectUrl);
      return;
    }
    res.status(401).end('Invalid authentication');
    return;
  } catch (err) { logger.error(err); next(err); }
}


export async function getUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user with ID ', req.jwt.user.id);
  const user = await models.User.findById(req.jwt.user.id, 'flag connections roles phone_display')
  .populate('roles.role')
  .exec();
  if (user) {
    return res.json(user);
  }
  return res.status(404).end('User not found.');
}

export async function getUserSubmissions(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user submissions with ID ', req.jwt.user.id);
  return res.json(await models.Submission.find({ user: req.jwt.user.id }, 'event user game category platform estimate runType teams video comment description status notes'));
}

export async function getUserApplications(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user applications with ID ', req.jwt.user.id);
  return res.json(await models.Application.find({ user: req.jwt.user.id }));
}

function maskPhone(phoneNumber) {
  const numDigits = phoneNumber.match(/\d/g).length;
  let digitsToMask = -2;
  return phoneNumber.replace(/\d/g, match => {
    digitsToMask += 1;
    if (digitsToMask > 0 && digitsToMask < numDigits - 3) return 'X';
    return match;
  });
}

function encryptPhoneNumber(phoneNumber) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', settings.auth.encryptionKey, IV);
  let encrypted = `${IV.toString('hex')}|`;
  encrypted += cipher.update(`|${phoneNumber}`, 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function parseDuration(duration) {
  const [hours, minutes] = /(\d+):(\d+)/.exec(duration);
  return parseInt(hours, 10) * 3600 * 1000 + parseInt(minutes, 10) * 60 * 1000;
}

const allowedUserModifications = new Map([
  ['flag', _.set],
  ['connections.twitter.handle', _.set],
  ['phone', (obj, prop, val) => {
    obj.phone_encrypted = encryptPhoneNumber();
    obj.phone_display = maskPhone(val);
  }]
]);
export async function updateUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (user) {
    console.log('Request body: ', req.body);
    const badChanges = _.filter(await Promise.all(_.map(req.body, async (value, property) => {
      const mutator = allowedUserModifications.get(property);
      if (mutator) {
        try {
          await mutator(user, property, value, user);
        } catch (err) {
          console.error('Mutation error:', err);
          return property;
        }
      } else {
        console.log('Mutator for ', property, 'not found');
        return property;
      }
      return null;
    })));
    console.log('Bad changes:', badChanges);
    if (badChanges.length > 0) {
      res.status(400).end(`Invalid propert${badChanges.length > 1 ? 'ies' : 'y'} ${badChanges.join(', ')}`);
      return res;
    }
    user.save(err => {
      if (err) {
        logger.error(res, err);
      }
    });
    return res.json(user);
  }
  return res.status(404).end('User not found.');
}

function mergeNonArray(item, data) {
  return _.mergeWith(item, data, (obj, src) => (_.isArray(src) ? src : undefined));
}

export async function updateUserApplication(req, res) {
  // TODO: verify event
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  let application = await models.Application.findById(req.body._id).exec();
  const validChanges = _.pick(req.body, ['role', 'questions', 'comment']);
  if (req.body.status && req.body.status === 'saved' || req.body.status === 'saved') validChanges.status = req.body.status;
  if (application) {
    if (!application.user.equals(req.jwt.user.id)) return res.status(403).end('Access denied.');
    mergeNonArray(application, validChanges);
    if (req.body.questions) application.markModified('questions');
  } else {
    application = new models.Application({
      _id: req.body._id,
      user: req.jwt.user.id,
      event: req.body.event,
      ...validChanges
    });
  }
  await application.save();
  return res.json(application);
}

export async function updateUserSubmission(req, res) {
  // TODO: verify event
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  let submission = await models.Submission.findById(req.body._id).exec();
  console.log(`Found existing submission for ${req.body._id}:`, submission);
  const validChanges = _.pick(req.body, ['game', 'category', 'platform', 'estimate', 'runType', 'teams', 'video', 'comment', 'description']);
  if (req.body.status && req.body.status === 'saved' || req.body.status === 'saved') validChanges.status = req.body.status;
  if (submission) {
    if (!submission.user.equals(req.jwt.user.id)) return res.status(403).end(`Access denied to user ${req.jwt.user.id}`);
    mergeNonArray(submission, validChanges);
  } else {
    submission = new models.Submission({
      _id: req.body._id,
      user: req.jwt.user.id,
      event: req.body.event,
      ...validChanges
    });
  }
  await submission.save();
  return res.json(submission);
}

async function updateModel(Model, data, markModified) {
  let item = await Model.findOne({ _id: data._id }).exec();
  if (item) {
    delete data._id;
    mergeNonArray(item, data);
    _.each(markModified, prop => item.markModified(prop));
  } else {
    item = new Model(data);
  }
  console.log('Saving item', item);
  return item.save();
}

function hasPermission(user, eventID, permission) {
  if (!mongoose.Types.ObjectId.isValid(eventID)) return false;
  console.log('Checking user', user.roles, 'for permission', permission, 'in event', eventID);
  return !!_.find(user.roles, userRole => {
    if (userRole.event && userRole.event !== eventID) return false;
    return userRole.role.permissions.includes('*') || userRole.role.permissions.includes(permission);
  });
}

export async function updateEvent(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.body._id, 'Manage Events')) {
    console.log('Updating event with', req.body);
    const result = await updateModel(models.Event, req.body);
    return res.json(result);
  }
  return res.status(403).end('Access denied.');
}

export async function updateRole(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, null, 'Manage Roles')) {
    console.log('Updating role with', req.body);
    const result = await updateModel(models.Role, req.body);
    return res.json(result);
  }
  return res.status(403).end('Access denied.');
}

export async function requestSensitiveData(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, null, 'Read Donations')) {
    return res.json({ memes: 'are good' });
  }
  return res.status(403).end('Access denied.');
}

export async function getEvent(req, res) {
  if (req.params.event) return res.json(await models.Event.find({ _id: req.params.event }));
  return res.json(await models.Event.find({ status: { $ne: 'deleted' } }));
}

export async function getRoles(req, res) {
  return res.json(await models.Role.find());
}

export async function getUsers(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, null, 'Edit Users')) {
    const query = {};
    if (req.query.name) query.connections.twitch.name = { $search: req.query.name };
    console.log('Query:', query);
    let result = await models.User.find(query, 'flag roles submissions applications connections').populate('roles.role');
    console.log('Result:', result);
    result = _.map(result, item => ({
      name: item.name,
      connections: {
        twitch: {
          id: item.connections.twitch.id,
          name: item.connections.twitch.name,
          logo: item.connections.twitch.logo
        },
        twitter: {
          handle: item.connections.twitter && item.connections.twitter.handle
        },
        discord: {
          name: item.connections.discord && item.connections.discord.name
        }
      },
      flag: item.flag,
      roles: _.map(item.roles, roleInfo => roleInfo.role.name).join(', ')
    }));
    return res.json(result);
  }
  return res.status(403).end('Access denied.');
}

const runDecisionPermission = 'Approve Submissions';

export async function getSubmissions(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  if (!req.query.event) return res.status(400).end('Missing query parameter event');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.query.event, runDecisionPermission)) {
    return res.json(await models.Submission.find({ event: req.query.event })
    .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo')
    .exec());
  }
  return res.status(403).end('Access denied.');
}

export async function getApplications(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  if (!req.query.event) return res.status(400).end('Missing query parameter event');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.query.event, runDecisionPermission)) {
    return res.json(await models.Application.find({ event: req.query.event })
    .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo')
    .exec());
  }
  return res.status(403).end('Access denied.');
}

export async function updateRunDecision(req, res, next) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  if (!req.body.run) return res.status(400).end('Missing run ID');
  if (!req.body.cut) return res.status(400).end('Missing cut');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.body.event, runDecisionPermission)) {
    const run = await models.Submission.findById(req.body.run, 'event decisions');
    if (!run) return res.status(404).end(`Run ${req.body.run} not found`);
    let decision = _.find(run.decisions, { cut: req.body.cut, user: user._id });
    console.log('Found decision: ', decision);
    if (decision) {
      _.merge(decision, _.pick(req.body, ['decision', 'explanation']));
    } else {
      console.log('Inserting decision:', req.body);
      decision = run.decisions.push({
        user: req.jwt.user.id,
        decision: req.body.decision,
        explanation: req.body.explanation,
        cut: req.body.cut
      });
    }
    try {
      await run.save();
      return res.json(decision);
    } catch (err) {
      next(err);
    }
  }
  return res.status(403).end('Access denied.');
}
