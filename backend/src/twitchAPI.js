import _ from 'lodash';

import logger from './logger';
import settings from './settings';
import { throttleAsync, httpReq } from './helpers';

export function twitchGet(url, headers, token, query) {
  if (!headers) headers = {};
  headers['Client-ID'] = settings.twitch.clientID;
  if (token) headers.authorization = `OAuth ${token}`;
  if (!headers.accept) headers.accept = 'application/vnd.twitchtv.v5+json';
  logger.debug(`Getting ${url}`);
  return httpReq(url, { headers, query });
}

export function twitchPost(url, headers, token, body) {
  if (!headers) headers = {};
  headers['Client-ID'] = settings.twitch.clientID;
  if (token) headers.authorization = `OAuth ${token}`;
  if (!headers.accept) headers.accept = 'application/vnd.twitchtv.v5+json';
  logger.debug(`Posting to ${url}`);
  return httpReq(url, { headers, body });
}
const userIDByName = {};
export async function twitchGetIDByName(userName) {
  if (userIDByName[userName]) return userIDByName[userName];
  const userResponse = await twitchGet(`https://api.twitch.tv/kraken/users/?login=${userName}`);
  userIDByName[userName] = userResponse.users[0]._id;
  return userIDByName[userName];
}

export async function twitchGQL(query, variables) {
  return twitchPost('https://api.twitch.tv/gql', null, null, { query, variables, extensions: {} });
}


async function getModList() {
  logger.debug('Querying for mod list');
  const query = `query mod_check($userId: ID, $count: Int){
    user(id: $userId) {
     mods(first: $count) {
      edges{
       cursor
       node{
        displayName
        id
        login
       }
      }
      pageInfo{
       hasNextPage
      }
     }
    }
   }`;
  const variables = { userId: settings.twitch.channels[0].id, count: 100 };
  const result = await twitchGQL(query, variables);
  return _.map(result.body.data.user.mods.edges, edge => edge.node);
}

const getModListThrottled = throttleAsync(getModList, 60000);

export async function checkModStatus(user) {
  const adminStatus = _.find(settings.admins, { id: user.id });
  if (adminStatus) {
    return _.merge({ admin: true }, adminStatus);
  }
  logger.debug('Getting mod status for ', user);
  const modList = await getModListThrottled(true);
  return _.find(modList, { id: user.id });
}
