import _ from 'lodash';
import { models } from '../models';

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
