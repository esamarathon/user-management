import fs from 'fs';

import jwt from 'jsonwebtoken';
import settings from './settings';

const privateKey = fs.readFileSync('../private.pem');
const publicKey = fs.readFileSync('../public.pem');

export function decodeToken(token) {
  return jwt.verify(token, publicKey, { algorithms: [settings.auth.algorithm] });
}

export function encodeToken(payload) {
  return jwt.sign(payload, privateKey, { algorithm: settings.auth.algorithm });
}

export function generateToken(token, user) {
  return encodeToken({ auth: { token }, user });
}
