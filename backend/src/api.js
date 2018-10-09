import got from 'got';
import crypto from 'crypto';
import URL from 'url';
import _ from 'lodash';

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
      const jwt = generateToken(token, { id: userResponse._id, login: userResponse.name, displayName: userResponse.display_name });

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
        user.connections.twitch.name = userResponse.name;
        user.connections.twitch.displayName = userResponse.display_name;
        user.connections.twitch.logo = userResponse.logo;
        user.connections.twitch.email = userResponse.email;
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
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id }, 'flag connections roles submissions applications phone_display')
  .populate('roles.role')
  .populate('applications')
  .populate('submissions')
  .exec();
  if (user) {
    return res.json(user);
  }
  return res.status(404).end('User not found.');
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
  }],
  ['submission', async (obj, prop, val, user) => {
    console.log(user.submissions);
    let submission = await models.Submission.findById(val._id);
    console.log(`Found submission ${val._id}`, submission);
    if (submission) {
      if (user.submissions && user.submissions.indexOf(val._id.toString()) >= 0) {
        delete val._id;
        _.merge(submission, val);
        submission.save();
      } else {
        throw new Error('Invalid submission ID.');
      }
    } else {
      submission = new models.Submission(val);
      await submission.save();
      console.log('After save:', submission);
      obj.submissions.push(submission);
    }
  }],
  ['application', async (obj, prop, val, user) => {
    console.log(user.application);
    let application = await models.Application.findById(val._id);
    console.log(`Found application ${val._id}`, application);
    if (application) {
      if (user.applications && user.applications.indexOf(val._id.toString()) >= 0) {
        delete val._id;
        console.log('Application before merge', application);
        _.merge(application, val);
        application.markModified('questions');
        console.log('Application after merge', application);
        application.save();
      } else {
        throw new Error('Invalid application ID.');
      }
    } else {
      application = new models.Application(val);
      await application.save();
      console.log('After save:', application);
      obj.applications.push(application);
    }
  }]
]);
export async function updateUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id }).populate('roles.role').exec();
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
  console.log('Checking user', user.roles, 'for permission', permission, 'in event', eventID);
  return !!_.find(user.roles, userRole => {
    if (userRole.event && userRole.event !== eventID) return false;
    return userRole.role.permissions.includes('*') || userRole.role.permissions.includes(permission);
  });
}

export async function updateEvent(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id }).populate('roles.role').exec();
  if (hasPermission(user, req.body._id, 'Manage Events')) {
    console.log('Updating event with', req.body);
    const result = await updateModel(models.Event, req.body);
    return res.json(result);
  }
  return res.status(403).end('Access denied.');
}

export async function updateRole(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id }).populate('roles.role').exec();
  if (hasPermission(user, req.body._id, 'Manage Roles')) {
    console.log('Updating role with', req.body);
    const result = await updateModel(models.Role, req.body);
    return res.json(result);
  }
  return res.status(403).end('Access denied.');
}

export async function requestSensitiveData(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id }).populate('roles.role').exec();
  if (hasPermission(user, req.body._id, 'Read Donations')) {
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
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id }).populate('roles.role').exec();
  if (hasPermission(user, req.body._id, 'Edit Users')) {
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
          name: item.connections.twitter && item.connections.twitter.name
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
