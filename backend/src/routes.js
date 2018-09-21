import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import expressWs from 'express-ws';
import expressPinoLogger from 'express-pino-logger';
import cors from 'cors';

import settings from './settings';
import {
  handleLogin, getUser, updateUser, getEvent
} from './api';
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

app.get('/login', handleLogin);
app.ws('/socket', handleWebsocket);

app.get('/events/', getEvent);
app.get('/event/:event/', getEvent);
app.get('/user', getUser);
app.post('/user', updateUser);
app.get('/users', getUser);

server.listen(settings.api.port);
export { server, app };
