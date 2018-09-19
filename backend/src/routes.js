import _ from 'lodash';
import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import expressWs from 'express-ws';
import expressPinoLogger from 'express-pino-logger';
import cors from 'cors';

import settings from './settings';
import { handleLogin, handleLogout, getUser } from './api';
import { handleWebsocket } from './websocket';
import logger from './logger';
import { publicKey } from './auth';


const app = express();
const server = http.Server(app);

const expressPino = expressPinoLogger({ logger });

app.use(expressPino);
expressWs(app, server);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use(jwt({
  secret: publicKey,
  algorithms: ['RS256'],
  credentialsRequired: false,
  requestProperty: 'jwt'
}));

app.get('/', getUser);
app.get('/login', handleLogin);
app.get('/logout', handleLogout);
app.ws('/socket', handleWebsocket);

server.listen(settings.api.port);
export { server, app };
