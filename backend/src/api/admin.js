import _ from 'lodash';
import { hasPermission, updateModel, mergeNonArray } from './helpers';
import { models } from '../models';
import cache from '../cache';

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
    const result = await models.User.find(query,
      'flag roles submissions applications availability connections.twitch.id connections.twitch.name connections.twitch.displayName '
      + 'connections.twitch.logo connections.twitter.handle connections.srdotcom.name connections.discord.name connections.discord.discriminator');
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


export async function updateRunDecision(req, res, next) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  if (!req.body.run) return res.status(400).end('Missing run ID');
  if (!req.body.cut) return res.status(400).end('Missing cut');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (hasPermission(user, req.body.event, 'Approve Volunteers')) {
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


const runDecisionPermission = 'Approve Submissions';

export async function getSubmissions(req, res) {
  if (!req.query.event) return res.status(400).end('Missing query parameter event');
  const user = req.jwt ? await models.User.findById(req.jwt.user.id).populate('roles.role').exec() : null;

  let runs = [];
  if (user && hasPermission(user, req.query.event, runDecisionPermission)) {
    console.log('Has permission');
    runs = await models.Submission.find({ event: req.query.event, status: { $in: ['saved', 'accepted', 'rejected'] } },
      'status createdAt event user game twitchGame leaderboards category platform estimate runType runners video comment decisions incentives')
    .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.srdotcom.name availability')
    .exec();
    _.each(runs, run => { run.user.availability = _.filter(run.user.availability, availability => availability.event.toString() === req.query.event); });
  } else {
    console.log('Doesnt have permission');
    runs = await cache.get(`publicSubmissions/${req.query.event}`,
      async () => models.Submission.find({ event: req.query.event, status: { $in: ['saved', 'accepted', 'rejected'] } },
        'status createdAt event user game category platform estimate runType runners')
      .populate('user', 'connections.twitch.name connections.twitch.displayName connections.twitch.logo connections.srdotcom.name')
      .exec());
  }
  return res.json(runs);
}


export async function getRoles(req, res) {
  return res.json(await models.Role.find());
}
