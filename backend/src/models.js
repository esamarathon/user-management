import mongoose from 'mongoose';
import './db';

const TwitchConnection = new mongoose.Schema({
  name: String,
  displayName: String,
  id: String,
  logo: String,
  email: String,
  oauthToken: String,
  refreshToken: String,
  expiresAt: String
});

const DiscordConnection = new mongoose.Schema({
  name: String,
  oauthToken: String,
  refreshToken: String,
  expiresAt: String
});

const SpeedrunConnection = new mongoose.Schema({
  name: String,
  token: String
});

const TwitterConnection = new mongoose.Schema({
  handle: String
});

const Role = new mongoose.Schema({
  name: String,
  permissions: [String]
});

const User = new mongoose.Schema({
  flag: String,
  connections: {
    twitch: TwitchConnection,
    discord: DiscordConnection,
    speedrun: SpeedrunConnection,
    twitter: TwitterConnection
  },
  phone_display: String, // first and last characters from the phone number
  phone_encrypted: String, // SHA-256 encrypted phone number
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'role' }],
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'submission' }],
  appications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'application' }]
});

User.virtual('name').get(() => {
  let name = this.connections.twitch.displayName;
  if (name.toLowerCase() !== this.connections.twitch.name) name += ` (${this.connections.twitch.name})`;
  return name;
});

const Note = new mongoose.Schema({
  author: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  text: String
}, {
  timestamps: true
});

const Participant = new mongoose.Schema({
  name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  accepted: Boolean
});

const Team = new mongoose.Schema({
  members: [Participant],
  name: String
});

const Submission = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  game: String,
  category: String,
  platform: String,
  estimate: String,
  runType: String, // 'solo', race', 'coop', 'relay'
  teams: [Team],
  comment: String,
  description: String,
  status: String,
  notes: [Note]
});

const Application = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
  status: String,
  comment: String
});

const Link = new mongoose.Schema({
  name: String,
  params: Object
});

const Event = new mongoose.Schema({
  name: String,
  identifier: String,
  start: Date,
  end: Date,
  submissionsStart: Date,
  submissionsEnd: Date,
  applicationsStart: Date,
  applicationsEnd: Date
});

const Activity = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  category: String,
  type: { type: String },
  link: Link
});

export const schemas = {
  Role, User, Submission, Event, TwitchConnection, DiscordConnection, SpeedrunConnection
};
export const models = {
  Event: mongoose.model('event', Event),
  Role: mongoose.model('role', Role),
  User: mongoose.model('user', User),
  Submission: mongoose.model('submission', Submission),
  Application: mongoose.model('application', Application),
  Activity: mongoose.model('activity', Activity)
};
