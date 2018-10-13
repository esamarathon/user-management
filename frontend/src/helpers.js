import _ from 'lodash';

function bufferToHex(buffer) {
  return Array
    .from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateID() {
  const u = crypto.getRandomValues(new Uint8Array(12));
  return bufferToHex(u);
}

export function parseDuration(duration) {
  const [hours, minutes] = /(\d+):(\d+)/.exec(duration);
  return parseInt(hours, 10) * 3600 * 1000 + parseInt(minutes, 10) * 60 * 1000;
}

export function mergeNonArray(item, data) {
  return _.mergeWith(item, data, (obj, src) => {
    if (_.isArray(src)) {
      return src;
    }
  });
}

export function getUserName(user) {
  const name = user.connections.twitch.displayName;
  return name + ((name.toLowerCase() === user.connections.twitch.name) ? '' : ` (${user.connections.twitch.name})`);
}

export function teamsToString(teams) {
  return _.map(_.filter(teams, team => team.members.length > 0),
    team => _.map(_.filter(team.members, member => member.name && member.name.length > 0),
      member => (member.user ? getUserName(member) : member.name))
      .join(', '))
    .join(' vs ');
}
