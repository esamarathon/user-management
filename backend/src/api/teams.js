import _ from 'lodash';
import { isInSubmissionsPeriod, hasPermission } from './helpers';
import { models } from '../models';
import { twitchGet } from '../twitchAPI';
import { notify } from '../helpers';

export async function inviteUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const submission = await models.Submission.findById(req.body.submission).populate('event').exec();
  if (!isInSubmissionsPeriod(submission.event) && !submission.event.alwaysEditable.includes('invitations') && !hasPermission(submission.user, submission.event._id, 'Edit Runs')) {
    return res.status(400).end('Can only invite people during the submission period!');
  }
  const inviter = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (submission) {
    if (submission.user.equals(req.jwt.user.id) || !hasPermission(inviter, submission.event._id, 'Edit Runs')) {
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
