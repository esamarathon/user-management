import jwt from 'jsonwebtoken';
import settings from './settings';

import publicKey from '../../public.pem';

export function decodeToken(token) {
  console.log('Decoding token', token, publicKey, settings.auth.algorithm);
  return jwt.verify(token, publicKey, { algorithms: [settings.auth.algorithm] });
}
