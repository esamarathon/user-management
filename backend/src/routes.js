import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import expressWs from 'express-ws';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

import settings from './settings';
import {
  handleLogin, handleDiscordLogin, handleDiscordLogout, getUser,
  updateUser, getEvent, updateEvent,
  requestSensitiveData, getRoles, updateRole,
  getUsers, getUserApplications, getUserSubmissions,
  updateUserApplication, updateUserSubmission, uploadApplicationSoundFile, getUploadedApplicationSoundFile,
  getApplications, getSubmissions, getSubmission,
  updateRunDecision, inviteUser, getActivities, respondToInvitation, setUser, getFeed,
  getFeedForEvent, updateFeed, deleteFeed, unsubscribe
} from './api';
import { handleWebsocket } from './websocket';
import { publicKey } from './auth';
import db from './db';
import { generateID } from './helpers';


const app = express();
const server = http.Server(app);

const storage = multer.diskStorage({
  destination: 'uploads',
  filename(req, file, cb) {
    cb(null, `${generateID()}.mp3`);
  }
});
const megabyte = 1024 * 1024;
const upload = multer({ storage, limits: { fileSize: 5 * megabyte } });

expressWs(app, server);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  maxAge: 3600
}));

app.use(jwt({
  secret: publicKey,
  algorithms: ['RS256'],
  credentialsRequired: false,
  requestProperty: 'jwt'
}));

function keyGenerator(req) {
  if (req.jwt) {
    return req.jwt.user.id;
  }
  return `${Math.random()}`;
}

app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  keyGenerator
}));

app.use('/user/invite', rateLimit({
  windowMs: 1000,
  max: 1,
  keyGenerator
}));

app.get('/login', handleLogin);
app.post('/unsubscribe', unsubscribe);
app.get('/discord', handleDiscordLogin);
app.delete('/discord', handleDiscordLogout);
app.ws('/socket', handleWebsocket);

app.get('/events/', getEvent);
app.post('/event', updateEvent);
app.get('/event/:event/', getEvent);
app.get('/user', getUser);
app.get('/user/applications', getUserApplications);
app.get('/user/submissions', getUserSubmissions);
app.post('/user', updateUser);
app.post('/user/application', updateUserApplication);
app.post('/user/application/upload', upload.single('fileInput'), uploadApplicationSoundFile);
app.get('/user/application/upload/:fileName', getUploadedApplicationSoundFile);
app.post('/user/submission', updateUserSubmission);
app.post('/user/invite', inviteUser);
app.post('/invitation/respond', respondToInvitation);
app.get('/activities', getActivities);
app.get('/feed', getFeed);
app.get('/feed/:event/', getFeedForEvent);
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
app.post('/feed', updateFeed);
app.delete('/feed', deleteFeed);

app.get('/sensitive', requestSensitiveData);

db.then(() => {
  server.listen(settings.api.port);
});
export { server, app };
