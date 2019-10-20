import _ from 'lodash';
import logger from '../logger';
import { encryptPhoneNumber, maskPhone } from './helpers';
import { models } from '../models';

const allowedUserModifications = [
  ['flag', _.set],
  ['connections.twitter.handle', _.set],
  ['connections.srdotcom.name', _.set],
  ['phone', (obj, prop, val) => {
    obj.phone_encrypted = encryptPhoneNumber();
    obj.phone_display = maskPhone(val);
  }],
  ['connections.discord.public', _.set],
  ['availability', _.set],
  ['notificationSettings.', _.set]
];
export async function updateUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id).populate('roles.role').exec();
  if (user) {
    console.log('Request body: ', req.body);
    const badChanges = _.filter(await Promise.all(_.map(req.body, async (value, property) => {
      const mutator = _.find(allowedUserModifications, item => item[0] === property || (item[0][item[0].length - 1] === '.' && property.startsWith(item[0])));
      if (mutator) {
        try {
          await mutator[1](user, property, value, user);
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


export async function getUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user with ID ', req.jwt.user.id);
  const user = await models.User.findById(req.jwt.user.id, 'flag connections roles phone_display availability notificationSettings')
  .populate('roles.role')
  .exec();
  if (user) {
    return res.json(user);
  }
  return res.status(404).end('User not found.');
}
