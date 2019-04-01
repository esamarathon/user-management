import mongoose from 'mongoose';
import './db';
import logger from './logger';

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
  id: String,
  name: String,
  discriminator: String,
  avatar: String,
  public: Boolean,
  oauthToken: String,
  refreshToken: String,
  expiresAt: String
});

const SrDotComConnection = new mongoose.Schema({
  name: String
});

const TwitterConnection = new mongoose.Schema({
  handle: String
});

const Question = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  options: Object
});

const Role = new mongoose.Schema({
  name: String,
  special: Boolean,
  permissions: [String],
  form: [Question],
  readOnly: Boolean
});

const UserRole = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' }
});

const UserAvailability = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  start: Date,
  end: Date
});

const User = new mongoose.Schema({
  flag: String,
  connections: {
    twitch: TwitchConnection,
    discord: DiscordConnection,
    srdotcom: SrDotComConnection,
    twitter: TwitterConnection
  },
  phone_display: String, // first and last characters from the phone number
  phone_encrypted: String, // SHA-256 encrypted phone number
  roles: [UserRole],
  availability: [UserAvailability]
});
User.index({ 'connections.twitch.id': 1 });

User.virtual('name').get(function getUserName() {
  let name = this.connections.twitch.displayName;
  if (!name) {
    logger.fatal('User', this, 'has no display name?');
  }
  if (name && name.toLowerCase() !== this.connections.twitch.name) name += ` (${this.connections.twitch.name})`;
  return name;
});

const Note = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  text: String
}, {
  timestamps: true
});

const Invitation = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'submission' },
  status: String
}, {
  timestamps: true
});
Invitation.index({ user: 1 });
Invitation.index({ submission: 1 });

const Team = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'invitation' }],
  name: String
});

const RunDecision = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  cut: String,
  decision: String,
  explanation: String
});

const Incentive = new mongoose.Schema({
  name: String,
  description: String,
  type: String,
  bidwarType: String,
  options: String,
  freeformMin: Number,
  freeformMax: Number
});

const Submission = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  game: String,
  twitchGame: String,
  leaderboards: String,
  category: String,
  platform: String,
  estimate: String,
  runType: String, // 'solo', race', 'coop', 'relay'
  teams: [Team],
  video: String,
  comment: String,
  status: String,
  notes: [Note],
  decisions: [RunDecision],
  invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'invitation' }],
  incentives: [Incentive]
}, {
  timestamps: true
});
Submission.index({ user: 1 });

const VolunteerDecision = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  cut: String,
  decision: String,
  explanation: String
}, {
  timestamps: true
});

const Application = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
  status: String,
  questions: Object,
  comment: String,
  decisions: [VolunteerDecision]
});
Application.index({ user: 1 });

const Link = new mongoose.Schema({
  name: String,
  params: Object
});

const Event = new mongoose.Schema({
  name: String,
  status: String,
  startDate: Date,
  endDate: Date,
  submissionsStart: Date,
  submissionsEnd: Date,
  applicationsStart: Date,
  applicationsEnd: Date,
  volunteersNeeded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'role' }]
}, {
  timestamps: true
});

const Activity = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  category: String,
  type: { type: String },
  text: String,
  link: Link,
  icon: String
}, {
  timestamps: true
});
Activity.index({ user: 1 });

const FeedItem = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
  text: String,
  icon: String,
  time: Date
}, {
  timestamps: true
});
FeedItem.index({ event: 1 });

export const schemas = {
  User, Role, Submission, Event, TwitchConnection, DiscordConnection, SrDotComConnection, Invitation
};
export const models = {
  Event: mongoose.model('event', Event),
  User: mongoose.model('user', User),
  Role: mongoose.model('role', Role),
  Submission: mongoose.model('submission', Submission),
  Application: mongoose.model('application', Application),
  Activity: mongoose.model('activity', Activity),
  Invitation: mongoose.model('invitation', Invitation),
  FeedItem: mongoose.model('feeditem', FeedItem)
};
