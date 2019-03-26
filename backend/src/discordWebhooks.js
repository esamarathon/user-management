import fetch from 'node-fetch';
import _ from 'lodash';
import settings from './settings';

export function teamsToString(teams) {
  return _.map(teams, team => _.map(team.members, member => member.user && member.user.connections.twitch.displayName).join(', ')).join(' vs ');
}

async function publicWebhook(data) {
  try {
    console.log('Sending public webhook', data);
    const response = await fetch(settings.discord.webhooks.public.url, {
      method: 'post',
      body: JSON.stringify({
        embeds: [data]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 204) console.log('Discord webhook succesfully placed!');
  } catch (err) {
    console.log(err);
  }
}
async function privateWebhook(data) {
  try {
    console.log('Sending private webhook', data);
    const response = await fetch(settings.discord.webhooks.private.url, {
      method: 'post',
      body: JSON.stringify({
        embeds: [data]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 204) console.log('Discord webhook succesfully placed!');
  } catch (err) {
    console.log(err);
  }
}

export function sendDiscordSubmission(submission) {
  const twitchUser = submission.user.connections.twitch;
  const twitchName = twitchUser.displayName.toLowerCase() === twitchUser.name ? twitchUser.displayName : `${twitchUser.displayName} (${twitchUser.name})`;
  const discordUser = submission.user.connections.discord;
  let category = submission.category;
  let teams = '';
  if (submission.runType !== 'solo') {
    category += ` (${submission.runType})`;
    teams = teamsToString(submission.teams);
  }
  let { incentive: incentives, bidwar: bidwars } = _.groupBy(submission.incentives, 'type');
  incentives = _.map(incentives, 'name').join(', ');
  bidwars = _.map(bidwars, 'name').join(', ');
  publicWebhook({
    title: 'A new run has been submitted!',
    url: `${settings.frontend.baseurl}#/dashboard/submissions/${submission._id}`,
    description: `${twitchName} has just submited a new run!\n\n`
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}`
  });
  privateWebhook({
    title: 'A new run has been submitted!',
    url: `${settings.frontend.baseurl}#/dashboard/submissions/${submission._id}`,
    description: `${twitchName} has just submited a new run!\n\n` // eslint-disable-line prefer-template
    + (discordUser ? `**Discord user:** <@!${discordUser.id}>\n` : '')
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}\n`
    + `**Estimate:** ${submission.estimate}\n`
    + (teams ? `**Players:** ${teams}\n` : '')
    + `**Video:** ${submission.video}\n`
    + (incentives ? `**Incentives:** ${incentives}\n` : '')
    + (bidwars ? `**Bid wars:** ${bidwars}` : '')
  });
}

export function sendDiscordSubmissionUpdate(submission, changes) {
  const twitchUser = submission.user.connections.twitch;
  const twitchName = twitchUser.displayName.toLowerCase() === twitchUser.name ? twitchUser.displayName : `${twitchUser.displayName} (${twitchUser.name})`;
  const discordUser = submission.user.connections.discord;
  let category = submission.category;
  let teams = '';
  if (submission.runType !== 'solo') {
    category += ` (${submission.runType})`;
    teams = teamsToString(submission.teams);
  }
  let oldTeams = '';
  let oldCategory = changes.category;
  if (submission.runType !== 'solo' && changes.teams) {
    oldCategory += ` (${submission.runType})`;
    oldTeams = teamsToString(changes.teams);
  }
  let { incentive: incentives, bidwar: bidwars } = _.groupBy(submission.incentives, 'type');
  incentives = _.map(incentives, 'name').join(', ');
  bidwars = _.map(bidwars, 'name').join(', ');

  let { incentive: oldIncentives, bidwar: oldBidwars } = _.groupBy(changes.incentives, 'type');
  if (changes.incentives) {
    oldIncentives = _.map(oldIncentives, 'name').join(', ');
    oldBidwars = _.map(oldBidwars, 'name').join(', ');
  }

  privateWebhook({
    title: 'A run has been updated!',
    url: `${settings.frontend.baseurl}#/dashboard/submissions/${submission._id}`,
    description: `${twitchName} has just updated an existing run!\n\n` // eslint-disable-line prefer-template
    + (discordUser ? `**Discord user:** <@!${discordUser.id}>\n` : '')
    + (changes.game ? `**Game:** ${submission.game} (was: ${changes.game})\n` : '')
    + (changes.category ? `**Category:** ${category} (was: ${oldCategory})\n` : '')
    + (changes.platform ? `**Platform:** ${submission.platform} (was: ${changes.platform})\n` : '')
    + (changes.estimate ? `**Estimate:** ${submission.estimate} (was: ${changes.estimate})\n` : '')
    + (teams !== oldTeams ? `**Players:** ${teams} (were: ${oldTeams})\n` : '')
    + (changes.video ? `**Video:** ${submission.video} (was: ${changes.video})\n` : '')
    + (incentives !== oldIncentives ? `**Incentives:** ${incentives} (were: ${oldIncentives})\n` : '')
    + (bidwars !== oldBidwars ? `**Bid wars:** ${bidwars} (were: ${oldBidwars})` : '')
  });
}


export function sendDiscordSubmissionDeletion(submission) {
  const twitchUser = submission.user.connections.twitch;
  const twitchName = twitchUser.displayName.toLowerCase() === twitchUser.name ? twitchUser.displayName : `${twitchUser.displayName} (${twitchUser.name})`;
  const discordUser = submission.user.connections.discord;
  let category = submission.category;
  let teams = '';
  if (submission.runType !== 'solo') {
    category += ` (${submission.runType})`;
    teams = teamsToString(submission.teams);
  }
  let { incentive: incentives, bidwar: bidwars } = _.groupBy(submission.incentives, 'type');
  incentives = _.map(incentives, 'name').join(', ');
  bidwars = _.map(bidwars, 'name').join(', ');
  privateWebhook({
    title: 'A run has been deleted!',
    url: `${settings.frontend.baseurl}#/dashboard/submissions/${submission._id}`,
    description: `${twitchName} has just deleted a run!\n\n` // eslint-disable-line prefer-template
    + (discordUser ? `**Discord user:** <@!${discordUser.id}>\n` : '')
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}\n`
    + `**Estimate:** ${submission.estimate}\n`
    + (teams ? `**Players:** ${teams}\n` : '')
    + `**Video:** ${submission.video}\n`
    + (incentives ? `**Incentives:** ${incentives}\n` : '')
    + (bidwars ? `**Bid wars:** ${bidwars}` : '')
  });
}
