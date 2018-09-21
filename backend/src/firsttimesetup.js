import { models } from './models';
import settings from './settings';


async function setUpEvents() {
  // set up default event if not defined
  const events = await models.Event.find();
  if (events.length === 0) {
    const defaultEvent = new models.Event({
      name: 'Default Event',
      identifier: 'defaultevent'
    });
    defaultEvent.save();
  }
}

async function setUpRoles() {
  // set up default roles if not defined
  const roles = await models.Role.find();
  if (roles.length === 0) {
    await models.Role.collection.insertMany([
      { name: 'Admin', permissions: settings.permissions }
    ]);
  }
}

Promise.all([setUpEvents(), setUpRoles()]).then(() => {
  console.log('First time setup complete');
});
