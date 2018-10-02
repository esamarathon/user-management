import _ from 'lodash';
import { jwtCookie } from './auth';
import settings from './settings';

export async function makeRequest(endpoint, options) {
  const optionsToUse = _.defaultsDeep({}, options, { headers: { accept: 'application/json' } });
  if (jwtCookie) {
    _.defaultsDeep(optionsToUse, { headers: { authorization: `Bearer ${jwtCookie}` } });
  }
  const response = await fetch(endpoint, optionsToUse);
  if (response.status === 200) {
    return JSON.parse(await response.text());
  }
  throw new Error(`Call to ${endpoint} returned with status ${response.status}${response.body ? `: ${response.body}` : ''}`);
}

export async function makeTwitchRequest(endpoint, options, token) {
  const optionsToUse = _.defaultsDeep({}, options, {
    headers: {
      accept: 'application/vnd.twitchtv.v5+json',
      'Client-ID': settings.twitch.clientID,
    },
  });
  if (token && !optionsToUse.headers.authorization && !optionsToUse.headers.Authorization) optionsToUse.headers.authorization = `OAuth ${token}`;
  const response = await fetch(endpoint, optionsToUse);
  if (response.status === 200) {
    return JSON.parse(await response.text());
  }
  throw new Error(`Call to ${endpoint} returned with status ${response.status}${response.body ? `: ${response.body}` : ''}`);
}

export function makePOST(endpoint, body, options) {
  const opts = _.merge({
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  }, options);
  return makeRequest(endpoint, opts);
}

export function getUser() {
  return makeRequest(`${settings.api.baseurl}user`);
}

export function getEvents() {
  return makeRequest(`${settings.api.baseurl}events`);
}

export function getEvent(eventID) {
  return makeRequest(`${settings.api.baseurl}event/${eventID}`);
}

export function flattenChanges(obj) {
  const res = {};
  _.each(obj, (val, key) => {
    if (_.isObject(val)) {
      _.each(flattenChanges(val), (val2, key2) => {
        res[`${key}.${key2}`] = val2;
      });
    } else {
      res[key] = val;
    }
  });
  return res;
}

export function updateUser(changes) {
  return makePOST(`${settings.api.baseurl}user`, flattenChanges(changes));
}

export function updateUserFlat(changes) {
  return makePOST(`${settings.api.baseurl}user`, changes);
}
