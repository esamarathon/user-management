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
    return undefined;
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

// youtube embedding code:
// <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/Tj6rUdhmIvQ" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
// twitch embedding code:
// <iframe src="https://player.twitch.tv/?autoplay=false&video=v49957211" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe><a href="https://www.twitch.tv/videos/49957211?tt_content=text_link&tt_medium=vod_embed" style="padding:2px 0px 4px; display:block; width:345px; font-weight:normal; font-size:10px; text-decoration:underline;">Watch Xrodon any% WR 5:55.28 from CBenni on www.twitch.tv</a>
export function getVideoData(url) {
  if (url) {
    const urlObj = new URL(url);
    let match;
    if (/(youtube.com|youtu.be)/g.test(urlObj.hostname)) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${urlObj.searchParams.get('v')}`,
      };
    }
    if (match = /twitch.tv\/videos\/(\d+)/g.exec(url)) { // eslint-disable-line no-cond-assign
      return {
        type: 'twitch',
        embedUrl: `https://player.twitch.tv/?autoplay=false&video=v${match[1]}`,
      };
    }
    if (match = /clips.twitch.tv\/(\w+)/g.exec(url)) { // eslint-disable-line no-cond-assign
      return {
        type: 'twitch',
        embedUrl: `https://clips.twitch.tv/embed?clip=${match[1]}`,
      };
    }
    return {
      type: 'unknown',
      linkUrl: url,
      host: urlObj.hostname,
    };
  }
  return {
    type: 'none',
  };
}

export function setCookie(name, value, time) {
  let expires = '';
  if (time) {
    const date = new Date();
    date.setTime(date.getTime() + time);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/`;
}
