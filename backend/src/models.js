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

const Permission = new mongoose.Schema({
  name: String,
  filter: Object
});

const Role = new mongoose.Schema({
  name: String,
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'permission' }]
});

const User = new mongoose.Schema({
  flag: String,
  connections: {
    twitch: TwitchConnection,
    discord: DiscordConnection,
    speedrun: SpeedrunConnection
  },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'role' }]
});

const Submission = new mongoose.Schema({
  name: String,
  isRace: Boolean,
  participants: [String],
  events: [Object],
  status: String
});

const Link = new mongoose.Schema({
  name: String,
  params: Object
});

const Event = new mongoose.Schema({
  category: String,
  event: String,
  link: Link
});

export const schemas = {
  Role, User, Submission, Event, Permission, TwitchConnection, DiscordConnection, SpeedrunConnection
};
export const models = {
  Role: mongoose.model('role', Role),
  Permission: mongoose.model('permission', Permission),
  User: mongoose.model('user', User),
  Submission: mongoose.model('submission', Submission),
  Event: mongoose.model('event', Event)
};
