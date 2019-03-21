import _ from 'lodash';

import db from './db';
import { models } from './models';
import settings from './settings';


async function setUpEvents() {
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

async function setUpRoles() {
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

db.then(() => {
  Promise.all([setUpEvents(), setUpRoles()]).then(() => {
    console.log('First time setup complete');
  });
});
