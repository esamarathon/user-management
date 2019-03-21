import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import expressWs from 'express-ws';
import cors from 'cors';

import settings from './settings';
import {
  handleLogin, getUser,
  updateUser, getEvent, updateEvent,
  requestSensitiveData, getRoles, updateRole,
  getUsers, getUserApplications, getUserSubmissions,
  updateUserApplication, updateUserSubmission, getApplications, getSubmissions, getSubmission, updateRunDecision, inviteUser, getActivities, respondToInvitation, setUser
} from './api';
import { handleWebsocket } from './websocket';
import { publicKey } from './auth';
import db from './db';


const app = express();
const server = http.Server(app);

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
app.post('/event', updateEvent);
app.get('/event/:event/', getEvent);
app.get('/user', getUser);
app.get('/user/applications', getUserApplications);
app.get('/user/submissions', getUserSubmissions);
app.post('/user', updateUser);
app.post('/user/application', updateUserApplication);
app.post('/user/submission', updateUserSubmission);
app.post('/user/invite', inviteUser);
app.post('/invitation/respond', respondToInvitation);
app.get('/activities', getActivities);
// ------------------------------------------------------
// Admin APIs
app.get('/users', getUsers);
app.get('/users', getUser);
app.post('/users', setUser);
app.post('/role', updateRole);
app.get('/roles', getRoles);
app.get('/applications', getApplications);
app.get('/submissions', getSubmissions);
app.get('/submission/:id', getSubmission);
app.post('/decision/runs', updateRunDecision);

app.get('/sensitive', requestSensitiveData);

db.then(() => {
  server.listen(settings.api.port);
});
export { server, app };
