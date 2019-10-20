import { isDeepStrictEqual } from 'util';
import _ from 'lodash';
import mongoose from 'mongoose';
import { isInSubmissionsPeriod, hasPermission, mergeNonArray } from './helpers';
import { models } from '../models';
import { teamsToString } from '../helpers';
import {
  sendDiscordSubmissionDecision, sendDiscordSubmissionUpdate, sendDiscordSubmissionDeletion, sendDiscordSubmission
} from '../discordWebhooks';
import cache from '../cache';
import { sendNotification } from '../notifications';

export async function getUserSubmissions(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user submissions with ID ', req.jwt.user.id);
  return res.json(await models.Submission.find({ user: req.jwt.user.id }, 'event user game twitchGame leaderboards category platform estimate runType teams runners video comment status notes invitations incentives')
  .populate({ path: 'invitations', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } })
  .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } }));
}

export async function updateUserSubmission(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  let submission = await models.Submission.findById(req.body._id)
  .populate({ path: 'user', select: 'connections.twitch.displayName connections.twitch.name' })
  .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.name' } })
  .exec();
  const event = await models.Event.findById((submission && submission.event) || req.body.event);
  if (!event) req.status(404).end('Event not found.');
  console.log('Event:', event);
  const user = await models.User.findById(req.jwt.user.id, 'roles connections.twitch.name connections.twitch.displayName').populate('roles.role').exec();
  // during the submissions period, all these values can be edited. Outside, only run editors can edit everything, otherwise just the alwaysEditable fields can be edited
  const fullyEditable = isInSubmissionsPeriod(event) || hasPermission(user, req.body.event, 'Edit Runs');
  const validChanges = _.pick(req.body, fullyEditable ? ['game', 'twitchGame', 'leaderboards', 'category', 'platform', 'estimate', 'runType', 'teams', 'video', 'comment', 'invitations', 'incentives'] : event.alwaysEditable);
  if (['stub', 'saved', 'deleted'].includes(req.body.status) || (req.body.status && hasPermission(user, req.body.event, 'Edit Runs'))) validChanges.status = req.body.status;

  if (!req.body.event) return res.status(400).end('Invalid event ID');
  let changeType;
  const oldVals = {};
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
    else if (submission.status !== 'deleted' && validChanges.status === 'deleted') changeType = 'deleted';
    else if (submission.status === 'deleted' && validChanges.status !== 'deleted') changeType = 'undeleted';
    else if (submission.status === validChanges.status) changeType = 'updated';
    else if (submission.status !== validChanges.status && validChanges.status === 'accepted') changeType = 'accepted';
    else if (submission.status !== validChanges.status && validChanges.status === 'rejected') changeType = 'rejected';
    _.each(validChanges, (val, key) => {
      if (!isDeepStrictEqual(submission[key], val)) oldVals[key] = submission[key];
    });
    mergeNonArray(submission, validChanges);
  } else {
    if (!isInSubmissionsPeriod(event)) return res.status(400).end('The submissions period for this event has ended.');
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
    if (changeType === 'new') {
      sendDiscordSubmission(user || submission.user, submission);
      sendNotification(user, {
        type: 'submissions',
        subject: 'Run submission recorded!',
        data: {
          message: `Your run ${submission.game} (${submission.category} ${submission.runType}) was successfully received.`
        }
      });
    }
    if (changeType === 'updated') sendDiscordSubmissionUpdate(user || submission.user, submission, oldVals);
    if (changeType === 'deleted' || changeType === 'undeleted') sendDiscordSubmissionDeletion(user || submission.user, submission, changeType);
    if (changeType === 'accepted' || changeType === 'rejected') sendDiscordSubmissionDecision(user || submission.user, submission, changeType);
  }
  return res.json(submission);
}


export async function getSubmission(req, res) {
  if (!req.params.id) return res.status(400).end('Missing query parameter id');
  return res.json(await models.Submission.findById(req.params.id, 'event user game twitchGame leaderboards category platform estimate runType teams runners invitations video comment status incentives')
  .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.srdotcom.name')
  .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } })
  .populate({ path: 'invitations', populate: { path: 'user', select: 'connections.twitch.displayName connections.twitch.id connections.twitch.logo' } })
  .exec());
}
