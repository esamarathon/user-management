import jsonwebtoken from 'jsonwebtoken';
import settings from './settings';

import publicKey from '../../public.pem';

export function decodeToken(token) {
  return jsonwebtoken.verify(token, publicKey, { algorithms: [settings.auth.algorithm] });
}

export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

let tokenFromCookie;
const cookie = getCookie('esa-jwt');
try {
  tokenFromCookie = decodeToken(cookie);
} catch (err) {
  // do nothing
}

export const jwt = tokenFromCookie;
export const jwtCookie = cookie;
