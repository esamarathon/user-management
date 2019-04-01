import _ from 'lodash';
import { models } from './models';
import { teamsToString } from './helpers';
import settings from './settings';

export default [
  {
    id: 'setupEvents',
    description: 'Sets up the events for the first time',
    async run() {
      // set up default event if not defined
      const events = await models.Event.find();
      if (events.length === 0) {
        const defaultEvent = new models.Event({
          name: 'Default Event'
        });
        return defaultEvent.save();
      }
      return null;
    }
  },
  {
    id: 'setupRoles',
    description: 'Sets up the roles for the first time',
    async run() {
      // set up default roles if not defined
      const roles = await models.Role.find();
      if (roles.length === 0) {
        return Promise.all(_.map(settings.defaultRoles, role => {
          const defaultRole = new models.Role(role);
          return defaultRole.save();
        }));
      }
      return null;
    }
  },
  {
    id: 'fixTimes',
    description: 'Updates estimates from hh:mm format (which turned out to not be very user friendly) to hh:mm:ss format "intelligently"',
    async run() {
      const allRuns = await models.Submission.find({}, 'estimate');
      await Promise.all(_.map(allRuns, run => {
        const match = /^(\d+):(\d+)$/.exec(run.estimate);
        if (match) {
          const [, hrs, mins] = match;
          if (parseInt(hrs, 10) < 15) {
            run.estimate = `${hrs.padStart(2, '0')}:${mins}:00`;
          } else {
            run.estimate = `00:${hrs.padStart(2, '0')}:${mins}`;
          }
          return run.save();
        }
        return true;
      }));
      return `Updated the estimates on ${allRuns.length} runs`;
    }
  },
  {
    id: 'addRunners',
    description: 'Adds the runners property to all runs',
    async run() {
      const allRuns = await models.Submission.find({}, 'user runType teams')
      .populate('user', 'connections.twitch.displayName')
      .populate({ path: 'teams.members', populate: { path: 'user', select: 'connections.twitch.displayName' } });
      await Promise.all(_.map(allRuns, run => {
        run.runners = run.runType === 'solo' ? run.user.connections.twitch.displayName : teamsToString(run.teams);
        return run.save();
      }));
      return `Updated the runners on ${allRuns.length} runs`;
    }
  }
];
