import fs from 'fs';

import jwt from 'jsonwebtoken';
import settings from './settings';

export const privateKey = fs.readFileSync('../private.pem');
export const publicKey = fs.readFileSync('../public.pem');

export function decodeToken(token) {
  return jwt.verify(token, publicKey, { algorithms: [settings.auth.algorithm] });
}

export function encodeToken(payload) {
  return jwt.sign(payload, privateKey, { algorithm: settings.auth.algorithm });
}

export function generateToken(token, user) {
  return encodeToken({ auth: { token }, user });
}

export function generateUnsubscribeToken(user) {
  return encodeToken({ uid: user._id, email: user.connections.twitch.email });
}
