import _ from 'lodash';
import { jwtCookie } from './auth';
import settings from './settings';

export function objectToQueryString(url, obj) {
  const res = new URL(url);
  _.each(obj, (val, key) => {
    res.searchParams.append(key, val);
  });
  return res;
}

export async function makeRequest(endpoint, options) {
  const optionsToUse = _.defaultsDeep({}, options, { headers: { accept: 'application/json' } });
  if (jwtCookie) {
    _.defaultsDeep(optionsToUse, { headers: { authorization: `Bearer ${jwtCookie}` } });
  }
  const response = await fetch(optionsToUse.query ? objectToQueryString(endpoint, optionsToUse.query) : endpoint, optionsToUse);
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

export function getUsers(query) {
  return makeRequest(`${settings.api.baseurl}users`, { query });
}

export function getUserApplications(query) {
  return makeRequest(`${settings.api.baseurl}user/applications`, { query });
}

export function getUserSubmissions(query) {
  return makeRequest(`${settings.api.baseurl}user/submissions`, { query });
}

export function getRoles() {
  return makeRequest(`${settings.api.baseurl}roles`);
}

export function getEvent(eventID) {
  return makeRequest(`${settings.api.baseurl}event/${eventID}`);
}

export function getRuns(eventID) {
  return makeRequest(`${settings.api.baseurl}submissions`, { query: { event: eventID } });
}

export function getDecisions(eventID, type) {
  return makeRequest(`${settings.api.baseurl}decisions/runs`, { query: { event: eventID, type } });
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

export function updateApplication(changes) {
  return makePOST(`${settings.api.baseurl}user/application`, changes);
}

export function updateSubmission(changes) {
  return makePOST(`${settings.api.baseurl}user/submission`, changes);
}

export function updateUserFlat(changes) {
  return makePOST(`${settings.api.baseurl}user`, changes);
}

export function updateEvent(event) {
  return makePOST(`${settings.api.baseurl}event`, event);
}

export function updateRole(role) {
  return makePOST(`${settings.api.baseurl}role`, role);
}

export function updateDecision(data) {
  return makePOST(`${settings.api.baseurl}decision/runs`, data);
}
