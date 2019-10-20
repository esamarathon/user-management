import _ from 'lodash';
import { decodeToken } from '../auth';
import logger from '../logger';
import { models } from '../models';


export async function unsubscribe(req, res) {
  try {
    const jwt = decodeToken(req.body.jwt);
    const email = jwt.email;
    if (email) {
      logger.debug(`Unsubscribing ${email} from all emails.`);
      const allUsers = await Promise.all(_.map(await models.User.find({ 'connections.twitch.email': email }, 'notificationSettings'), user => {
        _.each(user.notificationSettings.toObject(), (notifications, key) => {
          user.notificationSettings[key].email = false;
        });
        return user.save();
      }));
      res.json({ ok: true, usersAffected: allUsers.length });
    }
  } catch (err) {
    res.status(400).end(`Invalid JWT: ${err}`);
  }
}
