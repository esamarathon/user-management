import URL from 'url';
import _ from 'lodash';
import crypto from 'crypto';
import { isDeepStrictEqual } from 'util';

import mongoose from 'mongoose';
import logger from './logger';
import settings from './settings';
import { models } from './models';
import { twitchGet } from './twitchAPI';
import { generateToken, decodeToken } from './auth';
import {
  notify, httpPost, httpReq, teamsToString
} from './helpers';
import {
  sendDiscordSubmission, sendDiscordSubmissionUpdate, sendDiscordSubmissionDeletion
} from './discordWebhooks';
import cache from './cache';


const historySep = settings.vue.mode === 'history' ? '' : '#/';

function hasPermission(user, eventID, permission) {
  // if (!mongoose.Types.ObjectId.isValid(eventID)) return false;
  console.log('Checking user', user.roles, 'for permission', permission, 'in event', eventID);
  return !!_.find(user.roles, userRole => {
    console.log('Checking userRole', userRole);
    if (!userRole.event) {
      return userRole.role.permissions.includes('*') || userRole.role.permissions.includes(permission);
    }
    if (userRole.event.equals(eventID)) {
      // only apply local permissions to local roles
      if ((userRole.role.permissions.includes(permission) || userRole.role.permissions.includes('*')) && settings.permissions.includes(permission)) return true;
    }
    return false;
  });
}

export async function handleLogin(req, res) {
  const [csrf, redirect] = req.query.state.split(' ');
  const redirectUrl = decodeURIComponent(redirect || '') || settings.frontend.baseurl;
  const parsedRedirectUrl = URL.parse(redirectUrl);
  const domainFilter = new RegExp(settings.auth.domainFilter);
  if (!domainFilter.test(parsedRedirectUrl.hostname)) {
    res.status(403).end(`Invalid redirect URL: ${parsedRedirectUrl.hostname}!`);
    return;
  }
  try {
    if (req.cookies['esa-csrf'] && req.cookies['esa-csrf'] === csrf) {
      res.clearCookie('esa-csrf');
      logger.debug('Logging in...');
      const tokenResponse = await httpPost('https://api.twitch.tv/kraken/oauth2/token', {
        body: {
          client_id: settings.twitch.clientID,
          client_secret: settings.twitch.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: `${settings.api.baseurl}login`,
          code: req.query.code,
          state: req.query.state
        }
      });
      const token = tokenResponse.access_token;
      if (!token) throw new Error('Access token could not be received');
      const userResponse = await twitchGet('https://api.twitch.tv/kraken/user', null, token);
      console.log('User response:', userResponse);
      if (userResponse && userResponse._id) {
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
                refreshToken: tokenResponse.refresh_token,
                expiresAt: Date.now() + tokenResponse.expires_in * 1000
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
          user.connections.twitch.refreshToken = tokenResponse.refresh_token;
          user.connections.twitch.expiresAt = Date.now() + tokenResponse.expires_in * 1000;
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
      res.redirect(redirectUrl);
      return;
    }
    res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?twitch_linked=0&error=CSRF%20Token%20invalid`);
    return;
  } catch (err) {
    console.error(err);
    logger.error(err);
    res.redirect(redirectUrl);
  }
}

export async function handleDiscordLogin(req, res) {
  // check if the jwt is set as a cookie (!)
  const jwtCookie = req.cookies['esa-jwt'];
  let jwt;
  try {
    jwt = decodeToken(jwtCookie);
  } catch (err) {
    return res.status(401).end('Not authenticated');
  }
  // check the csrf token against the state
  try {
    if (req.cookies['discord-csrf'] && req.cookies['discord-csrf'] === req.query.state) {
      res.clearCookie('discord-csrf');
      // get the oauth token for discord
      logger.debug('Loggin in to discord...');
      const tokenResponse = await httpPost('https://discordapp.com/api/oauth2/token', {
        body: {
          client_id: settings.discord.clientID,
          client_secret: settings.discord.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: `${settings.api.baseurl}discord`,
          code: req.query.code,
          state: req.query.state
        }
      });
      console.log('tokenResponse:', tokenResponse);
      const token = tokenResponse.access_token;
      if (!token) throw new Error('Invalid token');
      const userResponse = await httpReq('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Discord user response:', userResponse);
      const user = await models.User.findById(jwt.user.id);
      user.connections.discord = {
        id: userResponse.id,
        name: userResponse.username,
        discriminator: userResponse.discriminator,
        avatar: userResponse.avatar,
        public: true,
        oauthToken: token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: Date.now() + tokenResponse.expires_in * 1000
      };
      await user.save();
      return res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?discord_linked=1`);
    }
    return res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?discord_linked=0&error=CSRF%20Token%20invalid`);
  } catch (err) {
    return res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?discord_linked=0&error=${encodeURIComponent(err.toString())}`);
  }
}

export async function handleDiscordLogout(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id, 'connections');
  user.connections.discord = null;
  await user.save();
  return res.json({ success: true });
}


export async function getUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user with ID ', req.jwt.user.id);
  const user = await models.User.findById(req.jwt.user.id, 'flag connections roles phone_display availability')
  .populate('roles.role')
  .exec();
  if (user) {
    return res.json(user);
  }
  return res.status(404).end('User not found.');
}

export async function getActivities(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const activities = await models.Activity.find({ user: req.jwt.user.id }, null, { sort: { updatedAt: -1 }, limit: 50 });
  const invitations = await models.Invitation.find({ user: req.jwt.user.id, status: 'pending' }, null, { sort: { updatedAt: -1 }, limit: 50 })
  .populate({ path: 'createdBy', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' })
  .populate({ path: 'submission', select: 'event game status runType category platform' });
  return res.json({
    activities,
    invitations
  });
}

function calculateEventFeed(event) {
  const now = Date.now();
  const ret = [];

  // this can probably be improved
  if (event.submissionsStart && event.submissionsStart < now) {
    ret.push({ event: event._id, text: `Submissions have been opened for ${event.name}. \nGo submit your runs [{"name": "Submissions"}](here)`, time: event.submissionsStart });
  }
  if (event.submissionsEnd && event.submissionsEnd < now) {
    ret.push({ event: event._id, text: `Submissions are now closed for ${event.name}`, time: event.submissionsEnd });
  }
  if (event.applicationsStart && event.applicationsStart < now) {
    ret.push({ event: event._id, text: `Volunteer applications have been opened for ${event.name}. \nGo apply [{"name": "Volunteers"}](here)`, time: event.applicationsStart });
  }
  if (event.applicationsEnd && event.applicationsEnd < now) {
    ret.push({ event: event._id, text: `Volunteer applications are now closed for ${event.name}`, time: event.applicationsEnd });
  }
  if (event.startDate && event.startDate < now) {
    ret.push({ event: event._id, text: `${event.name} has started!`, time: event.startDate });
  }
  if (event.endDate && event.endDate < now) {
    ret.push({ event: event._id, text: `${event.name} has unfortunately ended`, time: event.endDate });
  }

  return ret;
}

async function calculateEventFeeds() {
  const events = await models.Event.find({ status: { $eq: 'public' } });
  return _.flatten(_.map(events, event => calculateEventFeed(event)));
}

export async function getFeed(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  let eventFeed = calculateEventFeeds();
  const feed = await models.FeedItem.find(null, 'event text time', { sort: { time: -1 }, limit: 50 });
  eventFeed = await eventFeed;
  return res.json(_.sortBy(_.concat(feed, eventFeed), [feeditem => -feeditem.time]));
}

export async function getFeedForEvent(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const feed = await models.FeedItem.find({ event: req.params.event }).sort({ time: -1 })
  .populate({ path: 'user', select: 'connections.twitch.displayName connections.twitch.name' });
  return res.json(feed);
}

export async function getUserSubmissions(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user submissions with ID ', req.jwt.user.id);
  return res.json(await models.Submission.find({ user: req.jwt.user.id }, 'event user game twitchGame leaderboards category platform estimate runType teams runners video comment status notes invitations incentives')
  .populate({ path: 'invitations', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } })
  .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } }));
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
  ['connections.srdotcom.name', _.set],
  ['phone', (obj, prop, val) => {
    obj.phone_encrypted = encryptPhoneNumber();
    obj.phone_display = maskPhone(val);
  }],
  ['connections.discord.public', _.set],
  ['availability', _.set]
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
  let submission = await models.Submission.findById(req.body._id)
  .populate({ path: 'user', select: 'connections.twitch.displayName connections.twitch.name' })
  .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.name' } })
  .exec();
  // console.log(`Found existing submission for ${req.body._id}:`, submission);
  const validChanges = _.pick(req.body, ['game', 'twitchGame', 'leaderboards', 'category', 'platform', 'estimate', 'runType', 'teams', 'video', 'comment', 'invitations', 'incentives']);
  if (['stub', 'saved', 'deleted'].includes(req.body.status)) validChanges.status = req.body.status;

  if (!req.body.event) return res.status(400).end('Invalid event ID');
  let changeType;
  const oldVals = {};
  const user = await models.User.findById(req.jwt.user.id, 'roles connections.twitch.name connections.twitch.displayName').populate('roles.role').exec();
  if (submission) {
    // users can only edit their own runs (unless they have the Edit Runs permission)
    if (!submission.user.equals(req.jwt.user.id) && !hasPermission(user, req.body.event, 'Edit Runs')) return res.status(403).end(`Access denied to user ${req.jwt.user.id}`);
    // validate invites and teams
    if ((validChanges.teams && validChanges.teams.length > 0) || (validChanges.invitations && validChanges.invitations.length > 0)) {
      const allInvites = new Set(_.map(await models.Invitation.find({ submission: req.body._id }), invite => invite && invite._id.toString()));
      const allMembers = _.map(_.flattenDeep([validChanges.invitations || [], _.map(validChanges.teams, team => team.members) || []]), member => member._id || member);

      // update the runners
      const runType = validChanges.runType || submission.runType;
      validChanges.runners = runType === 'solo' ? submission.user.connections.twitch.displayName : teamsToString(validChanges.teams || submission.teams);

      // make sure no invites got added or removed
      for (let i = 0; i < allMembers.length; ++i) {
        const member = allMembers[i];
        if (!allInvites.delete(member._id || member)) {
          return res.status(400).end('Duplicate or invalid invite.');
        }
      }
      if (allInvites.size > 0) {
        console.log('Missing invites:', allInvites);
        return res.status(400).end('Missing invites.');
      }
      // strip everything but the IDs to prevent overwriting of invites
      _.each(validChanges.teams, team => { team.members = _.map(team.members, member => member && (member._id || member)); });
      validChanges.invitations = _.map(validChanges.invitations, invite => invite && (invite._id || invite));
    }
    if (submission.status === 'stub' && validChanges.status === 'saved') changeType = 'new';
    if (submission.status !== 'deleted' && validChanges.status === 'deleted') changeType = 'deleted';
    if (submission.status === 'deleted' && validChanges.status !== 'deleted') changeType = 'undeleted';
    if (submission.status === 'saved' && validChanges.status === 'saved') changeType = 'updated';
    _.each(validChanges, (val, key) => {
      if (!isDeepStrictEqual(submission[key], val)) oldVals[key] = submission[key];
    });
    mergeNonArray(submission, validChanges);
  } else {
    // maximum of 5 submissions per user
    const submissionAggregation = await models.Submission.aggregate([{ $match: { event: mongoose.Types.ObjectId(req.body.event), user: mongoose.Types.ObjectId(req.jwt.user.id), status: 'saved' } }, { $count: 'submissions' }]);
    console.log('Submission aggregation:', submissionAggregation);
    if (submissionAggregation[0] && submissionAggregation[0].submissions >= 5) return res.status(400).end('Maximum number of submissions exceeded.');

    // cant set up invites or teams before the submission is created, so we allow for the creation of stubs
    delete validChanges.invites;
    delete validChanges.teams;
    delete validChanges.status;
    submission = new models.Submission({
      _id: req.body._id,
      user: req.jwt.user.id,
      event: req.body.event,
      status: req.body.status || 'stub',
      runners: user.connections.twitch.displayName,
      ...validChanges
    });
    if (submission.status === 'saved') changeType = 'new';
  }
  cache.clear(`publicSubmissions/${submission.event}`);
  await submission.save();

  if (changeType) {
    await submission.populate('user', 'connections.twitch.displayName connections.twitch.name connections.discord.id connections.discord.name connections.discord.discriminator connections.srdotcom.name')
    .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } })
    .execPopulate();
    if (changeType === 'new') sendDiscordSubmission(user || submission.user, submission);
    if (changeType === 'updated') sendDiscordSubmissionUpdate(user || submission.user, submission, oldVals);
    if (changeType === 'deleted' || changeType === 'undeleted') sendDiscordSubmissionDeletion(user || submission.user, submission, changeType);
  }
  return res.json(submission);
}

export async function inviteUser(req, res) {
  // TODO: verify event
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const submission = await models.Submission.findById(req.body.submission).exec();
  if (submission) {
    if (submission.user.toString() === req.jwt.user.id) {
      console.log(`Found existing submission for ${req.body.submission}:`, submission);
      // see if an invite already exists
      // see if a user with this id already exists
      let user = await models.User.findOne({ 'connections.twitch.id': req.body.user });
      if (user) {
        console.log('User already exists.');
        const existingInvitation = await models.Invitation.findOne({ submission: req.body.submission, user });
        if (existingInvitation) {
          console.log('User already invited.');
          return res.status(400).end('User already invited.');
        }
      } else {
        let userResponse;
        try {
          userResponse = await twitchGet(`https://api.twitch.tv/kraken/users/${req.body.user}`);
          console.log('User response:', userResponse);
          user = new models.User({
            connections: {
              twitch: {
                name: userResponse.name,
                displayName: userResponse.display_name,
                id: userResponse._id,
                logo: userResponse.logo
              }
            }
          });
          await user.save();
        } catch (err) {
          console.log(err);
          return res.status(500).end('User lookup failed.');
        }
        // check again for race condition
        const existingInvitation = await models.Invitation.findOne({ submission: req.body.submission, user });
        if (existingInvitation) {
          console.log('User already invited.');
          return res.status(400).end('User already invited.');
        }
      }
      const invitation = new models.Invitation({
        user: user._id,
        createdBy: req.jwt.user.id,
        submission: submission._id,
        status: user._id.toString() === req.jwt.user.id ? 'accepted' : 'pending' // when the user invites themselves (this automatically happens when a submission is created), they get automatically accepted.
      });
      await invitation.save();
      if (!submission.invitations) submission.invitations = [];
      submission.invitations.push(invitation);
      await submission.save();
      const result = invitation.toObject();
      result.user = { _id: user._id, connections: { twitch: _.pick(user.connections.twitch, ['name', 'displayName', 'id', 'logo']) } };
      return res.json(result);
    }
    return res.status(403).end('Can only edit own runs.');
  }
  return res.status(404).end('Submission not found.');
}

export async function respondToInvitation(req, res) {
  // TODO: verify event
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id);
  const invitation = await models.Invitation.findById(req.body.invitation).populate('submission')
  .populate({ path: 'createdBy', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' });
  if (invitation && invitation.user._id.equals(user._id) && invitation.status === 'pending') {
    if (['accepted', 'denied'].includes(req.body.response)) {
      invitation.status = req.body.response;
      invitation.save();
      // notify the invitation creator
      notify(invitation.createdBy, {
        category: 'invitation',
        type: req.body.response,
        text: `${user.connections.twitch.displayName} ${req.body.response} your invitation for the run ${invitation.submission.game} (${invitation.submission.category} ${invitation.submission.runType})!`,
        icon: user.connections.twitch.logo,
        link: {
          name: 'SubmissionDetails',
          params: { id: invitation.submission._id }
        }
      });
      // notify the invitee
      notify(user, {
        category: 'invitation',
        type: req.body.response,
        text: `You ${req.body.response} your invitation for the run ${invitation.submission.game} (${invitation.submission.category} ${invitation.submission.runType}) by ${invitation.createdBy.connections.twitch.displayName}!`,
        icon: invitation.createdBy.connections.twitch.logo,
        link: {
          name: 'SubmissionDetails',
          params: { id: invitation.submission._id }
        }
      });
      return res.json(invitation);
    }
    return res.status(400).end('Submission is not in a modifiable state.');
  }
  console.log('Invalid invitation', invitation, invitation && invitation.user._id, req.jwt.user.id);
  return res.status(400).end('Invalid invitation.');
}

async function updateModel(Model, data, markModified) {
  let item = await Model.findOne({ _id: data._id }).exec();
  if (item) {
    if (item.readOnly === true) throw new Error('Item is read only!');
    delete data._id;
    mergeNonArray(item, data);
    _.each(markModified, prop => item.markModified(prop));
  } else {
    item = new Model(data);
  }
  console.log('Saving item', item);
  return item.save();
}

export async function updateEvent(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.body._id, 'Manage Events')) {
    console.log('Updating event with', req.body);
    try {
      const result = await updateModel(models.Event, req.body);
      return res.json(result);
    } catch (err) {
      return res.status(400).end(err.message);
    }
  }
  return res.status(403).end('Access denied.');
}

export async function updateRole(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, null, 'Manage Roles')) {
    console.log('Updating role with', req.body);
    try {
      const result = await updateModel(models.Role, req.body);
      return res.json(result);
    } catch (err) {
      return res.status(400).end(err.message);
    }
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

export async function updateFeed(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.body.event, 'Edit Feed')) {
    let feeditem = await models.FeedItem.findById(req.body._id).exec();

    if (feeditem) {
      delete req.body._id;
      mergeNonArray(feeditem, req.body);
      mergeNonArray(feeditem, { user: req.jwt.user.id });
    } else {
      feeditem = new models.FeedItem({
        _id: req.body._id,
        user: req.jwt.user.id,
        event: req.body.event,
        text: req.body.text,
        time: req.body.time
      });
    }
    console.log(feeditem);
    await feeditem.save();
    return res.json(feeditem);
  }
  return res.status(403).end('Access denied.');
}

export async function deleteFeed(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.body.event, 'Edit Feed')) {
    const feeditem = await models.FeedItem.findById(req.body._id).exec();

    if (feeditem) {
      await feeditem.delete();
    } else {
      res.status(404).end('Feed Item not found.');
    }

    return res.json({});
  }
  return res.status(403).end('Access denied.');
}

export async function getUsers(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, null, 'Edit Users')) {
    const query = {};
    if (req.query.name) query.connections.twitch.name = { $search: req.query.name };
    const result = await models.User.find(query, 'flag roles submissions applications availability connections.twitch.id connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.twitter.handle connections.srdotcom.name connections.discord.name connections.discord.discriminator');
    return res.json(result);
  }
  return res.status(403).end('Access denied.');
}

export async function setUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, null, 'Edit Users')) {
    const userToChange = await models.User.findById(req.body._id);
    _.each(req.body.roles, eventRole => {
      if (eventRole.event === 'global') eventRole.event = null;
    });
    mergeNonArray(userToChange, req.body);
    await userToChange.save();
    return res.json(userToChange);
  }
  return res.status(403).end('Access denied.');
}

const runDecisionPermission = 'Approve Submissions';

export async function getSubmissions(req, res) {
  if (!req.query.event) return res.status(400).end('Missing query parameter event');
  const user = req.jwt ? await models.User.findById(req.jwt.user.id).populate('roles.role').exec() : null;

  let runs = [];
  if (user && hasPermission(user, req.query.event, runDecisionPermission)) {
    console.log('Has permission');
    runs = await models.Submission.find({ event: req.query.event, status: { $in: ['saved', 'accepted', 'declined'] } }, 'createdAt event user game category platform estimate runType runners video comment decisions')
    .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.srdotcom.name')
    .exec();
  } else {
    console.log('Doesnt have permission');
    runs = await cache.get(`publicSubmissions/${req.query.event}`,
      async () => models.Submission.find({ event: req.query.event, status: { $in: ['saved', 'accepted', 'declined'] } },
        'createdAt event user game category platform estimate runType runners')
      .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.srdotcom.name')
      .exec());
  }
  return res.json(runs);
}

export async function getSubmission(req, res) {
  if (!req.params.id) return res.status(400).end('Missing query parameter id');
  return res.json(await models.Submission.findById(req.params.id, 'event user game twitchGame leaderboards category platform estimate runType teams runners invitations video comment status incentives')
  .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.srdotcom.name')
  .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } })
  .populate({ path: 'invitations', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } })
  .exec());
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
