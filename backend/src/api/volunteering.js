import _ from 'lodash';
import settings from '../settings';
import logger from '../logger';
import { models } from '../models';
import { hasPermission, isInApplicationsPeriod, mergeNonArray } from './helpers';
import { sendDiscordVolunteerDecision } from '../discordWebhooks';

export async function getUserApplications(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user applications with ID ', req.jwt.user.id);
  return res.json(await models.Application.find({ user: req.jwt.user.id }));
}


export async function uploadApplicationSoundFile(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  if (req.file) {
    console.log('File uploaded to', req.file);
    const uploadLog = new models.AudioUpload({
      user: req.jwt.user.id,
      fileName: req.file.filename,
      size: req.file.size
    });
    await uploadLog.save();
    return res.json({
      url: `${settings.api.baseurl}user/application/upload/${req.file.filename}`
    });
  }
  return res.status(500).end('Unknown upload error.');
}

export async function getUploadedApplicationSoundFile(req, res) {
  const requestedFile = req.params.fileName;
  if (/^\w+\.mp3$/.test(requestedFile)) {
    return res.sendFile(`${requestedFile}`, { root: 'uploads' });
  }
  return res.status(403).end('Invalid filename');
}

export async function updateUserApplication(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  let application = await models.Application.findById(req.body._id)
  .populate({ path: 'user', select: 'roles connections.twitch.displayName connections.twitch.name connections.discord.name connections.discord.discriminator connections.discord.id' }).exec();
  console.log('Application lookup:', application);
  const event = await models.Event.findById(application ? application.event : req.body.event);
  const user = await models.User.findById(req.jwt.user.id, 'roles connections.twitch.name connections.twitch.displayName').populate('roles.role').exec();
  const hasTeamLeaderPermission = hasPermission(user, event._id, 'Manage Roles') || hasPermission(user, event._id, 'Approve Volunteers');
  console.log('event:', event);
  console.log('user:', user);
  console.log('hasTeamLeaderPermission:', hasTeamLeaderPermission);
  if (!isInApplicationsPeriod(event) && !hasTeamLeaderPermission) return res.status(400).end('Application period has ended!');
  const validChanges = hasTeamLeaderPermission ? _.pick(req.body, ['questions', 'comment', 'status']) : _.pick(req.body, ['questions', 'comment']);
  const role = await models.Role.findById((req.body.role && (req.body.role._id || req.body.role)) || (application && application.role));
  if (!role) return res.status(404).end(`Role ${validChanges.role} not found`);
  validChanges.role = role;
  if (req.body.status && req.body.status === 'saved' || req.body.status === 'saved') validChanges.status = req.body.status;
  if (application) {
    console.log('Updating existing application...', validChanges);
    if (hasTeamLeaderPermission) {
      const targetUser = application.user;
      // assign or retract the role from the user
      if (validChanges.status === 'accepted') {
        logger.info('Adding role ', application.role.name, 'to', targetUser);
        targetUser.roles.push({
          event: event._id,
          role: application.role._id
        });
        console.log('targetUser:', targetUser);
        targetUser.save();
      } else if (validChanges.status === 'rejected') {
        logger.info('Removing role ', application.role.name, 'from', targetUser);
        const index = _.findIndex(targetUser.roles, eventRole => eventRole.event && eventRole.event.equals(event._id) && eventRole.role.equals(application.role._id));
        if (index >= 0) targetUser.roles.splice(index, 1);
        console.log('targetUser:', targetUser);
        targetUser.save();
      }
      if (validChanges.status !== application.status) {
        sendDiscordVolunteerDecision(user, application, role, validChanges.status);
      }
    } else if (!application.user.equals(req.jwt.user.id)) return res.status(403).end('Access denied.');
    mergeNonArray(application, validChanges);
    if (req.body.questions) application.markModified('questions');
  } else {
    console.log('Creating new application...', validChanges);
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


export async function getApplications(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  if (!req.query.event) return res.status(400).end('Missing query parameter event');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.query.event, 'Approve Volunteers')) {
    return res.json(await models.Application.find({ event: req.query.event })
    .populate('user', 'availability connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.discord.name connections.discord.discriminator')
    .exec());
  }
  return res.status(403).end('Access denied.');
}
