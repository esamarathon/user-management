import _ from 'lodash';
import { jwtCookie } from './auth';
import settings from './settings';

export async function makeRequest(endpoint, options) {
  const optionsToUse = _.defaultsDeep({}, options, { headers: { Accept: 'application/json' } });
  if (jwtCookie) {
    _.defaultsDeep(optionsToUse, { headers: { Authorization: `Bearer ${jwtCookie}` } });
  }
  const response = await fetch(endpoint, optionsToUse);
  if (response.status === 200) {
    return JSON.parse(await response.text());
  }
  throw new Error(`Call to ${endpoint} returned with status ${response.status}${response.body ? `: ${response.body}` : ''}`);
}

export function getUser() {
  return makeRequest(`${settings.api.baseurl}`);
}
