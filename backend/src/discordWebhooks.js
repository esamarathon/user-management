import fetch from 'node-fetch';
import _ from 'lodash';
import settings from './settings';
import logger from './logger';

async function publicWebhook(data) {
  try {
    logger.debug('Sending public webhook', data);
    const response = await fetch(settings.discord.webhooks.public.url, {
      method: 'post',
      body: JSON.stringify({
        embeds: [data]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 204) logger.debug('Discord webhook succesfully placed!');
  } catch (err) {
    logger.error(err);
  }
}
async function privateWebhook(data) {
  try {
    logger.debug('Sending private webhook', data);
    const response = await fetch(settings.discord.webhooks.private.url, {
      method: 'post',
      body: JSON.stringify({
        embeds: [data]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 204) logger.debug('Discord webhook succesfully placed!');
  } catch (err) {
    logger.error(err);
  }
}

export function sendDiscordSubmission(user, submission) {
  const submitterTwitchUser = submission.user.connections.twitch;
  const submitterTwitchName = submitterTwitchUser.displayName.toLowerCase() === submitterTwitchUser.name ? submitterTwitchUser.displayName : `${submitterTwitchUser.displayName} (${submitterTwitchUser.name})`;
  const discordUser = submission.user.connections.discord;
  let category = submission.category;
  if (submission.runType !== 'solo') {
    category += ` (${submission.runType})`;
  }
  let { incentive: incentives, bidwar: bidwars } = _.groupBy(submission.incentives, 'type');
  incentives = _.map(incentives, 'name').join(', ');
  bidwars = _.map(bidwars, 'name').join(', ');
  publicWebhook({
    title: 'A new run has been submitted!',
    url: `${settings.frontend.baseurl}${settings.vue.mode === 'history' ? '' : '#/'}dashboard/submissions/${submission._id}`,
    description: `${submitterTwitchName} has just submitted a new run!\n\n`
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}`
  });
  privateWebhook({
    title: 'A new run has been submitted!',
    url: `${settings.frontend.baseurl}${settings.vue.mode === 'history' ? '' : '#/'}dashboard/submissions/${submission._id}`,
    description: `${submitterTwitchName} has just submitted a new run!\n\n` // eslint-disable-line prefer-template
    + (discordUser ? `**Discord user:** <@${discordUser.id}> (${discordUser.name}#${discordUser.discriminator})\n` : '')
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}\n`
    + `**Estimate:** ${submission.estimate}\n`
    + `**Runners:** ${submission.runners}\n`
    + `**Video:** ${submission.video}\n`
    + (incentives ? `**Incentives:** ${incentives}\n` : '')
    + (bidwars ? `**Bid wars:** ${bidwars}` : '')
  });
}

export function sendDiscordSubmissionUpdate(user, submission, changes) {
  const submitterTwitchUser = submission.user.connections.twitch;
  const userTwitchUser = user.connections.twitch;
  const submitterTwitchName = submitterTwitchUser.displayName.toLowerCase() === submitterTwitchUser.name ? submitterTwitchUser.displayName : `${submitterTwitchUser.displayName} (${submitterTwitchUser.name})`;
  const userTwitchName = userTwitchUser.displayName.toLowerCase() === userTwitchUser.name ? userTwitchUser.displayName : `${userTwitchUser.displayName} (${userTwitchUser.name})`;
  const discordUser = submission.user.connections.discord;
  let category = submission.category;
  if (submission.runType !== 'solo') {
    category += ` (${submission.runType})`;
  }

  let oldCategory = `${changes.category || submission.category}`;
  if ((changes.runType && changes.runType !== 'solo') || submission.runType !== 'solo') {
    oldCategory += ` (${changes.runType || submission.runType})`;
  }
  let { incentive: incentives, bidwar: bidwars } = _.groupBy(submission.incentives, 'type');
  incentives = _.map(incentives, 'name').join(', ');
  bidwars = _.map(bidwars, 'name').join(', ');

  let { incentive: oldIncentives, bidwar: oldBidwars } = _.groupBy(changes.incentives, 'type');
  if (changes.incentives) {
    oldIncentives = _.map(oldIncentives, 'name').join(', ');
    oldBidwars = _.map(oldBidwars, 'name').join(', ');
  }

  const updates = _.filter([
    changes.game && `**Game:** ${submission.game} (was: ${changes.game})`,
    category !== oldCategory && `**Category:** ${category} (was: ${oldCategory})`,
    changes.platform && `**Platform:** ${submission.platform} (was: ${changes.platform})`,
    changes.estimate && `**Estimate:** ${submission.estimate} (was: ${changes.estimate})`,
    changes.runners && `**Runners:** ${submission.runners} (was: ${changes.runners})`,
    changes.video && `**Video:** ${submission.video} (was: ${changes.video})`,
    incentives !== oldIncentives && `**Incentives:** ${incentives} (were: ${oldIncentives})`,
    bidwars !== oldBidwars && `**Bid wars:** ${bidwars} (were: ${oldBidwars})`
  ]);

  console.log('Updates:', updates);

  if (updates.length > 0) {
    privateWebhook({
      title: 'A run has been updated!',
      url: `${settings.frontend.baseurl}${settings.vue.mode === 'history' ? '' : '#/'}dashboard/submissions/${submission._id}`,
      description: `${userTwitchName} has just updated an existing run!\n\n\n**Submit by:** ${submitterTwitchName}\n`
      + `${discordUser ? `**Discord user:** <@${discordUser.id}> (${discordUser.name}#${discordUser.discriminator})\n` : ''}${updates.join('\n')}`
    });
  }
}


export function sendDiscordSubmissionDeletion(user, submission, changeType) {
  const submitterTwitchUser = submission.user.connections.twitch;
  const userTwitchUser = user.connections.twitch;
  const submitterTwitchName = submitterTwitchUser.displayName.toLowerCase() === submitterTwitchUser.name ? submitterTwitchUser.displayName : `${submitterTwitchUser.displayName} (${submitterTwitchUser.name})`;
  const userTwitchName = userTwitchUser.displayName.toLowerCase() === userTwitchUser.name ? userTwitchUser.displayName : `${userTwitchUser.displayName} (${userTwitchUser.name})`;
  const discordUser = submission.user.connections.discord;
  let category = submission.category;
  if (submission.runType !== 'solo') {
    category += ` (${submission.runType})`;
  }
  let { incentive: incentives, bidwar: bidwars } = _.groupBy(submission.incentives, 'type');
  incentives = _.map(incentives, 'name').join(', ');
  bidwars = _.map(bidwars, 'name').join(', ');
  privateWebhook({
    title: `A run has been ${changeType}!`,
    url: `${settings.frontend.baseurl}${settings.vue.mode === 'history' ? '' : '#/'}dashboard/submissions/${submission._id}`,
    description: `${userTwitchName} has just ${changeType} a run!\n\n` // eslint-disable-line prefer-template
    + `**Submit by:** ${submitterTwitchName}\n`
    + (discordUser ? `**Discord user:** <@${discordUser.id}> (${discordUser.name}#${discordUser.discriminator})\n` : '')
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}\n`
    + `**Estimate:** ${submission.estimate}\n`
    + `**Runners:** ${submission.runners}\n`
    + `**Video:** ${submission.video}\n`
    + (incentives ? `**Incentives:** ${incentives}\n` : '')
    + (bidwars ? `**Bid wars:** ${bidwars}` : '')
  });
}

export function sendDiscordSubmissionDecision(user, submission, changeType) {
  const submitterTwitchUser = submission.user.connections.twitch;
  const userTwitchUser = user.connections.twitch;
  const submitterTwitchName = submitterTwitchUser.displayName.toLowerCase() === submitterTwitchUser.name ? submitterTwitchUser.displayName : `${submitterTwitchUser.displayName} (${submitterTwitchUser.name})`;
  const userTwitchName = userTwitchUser.displayName.toLowerCase() === userTwitchUser.name ? userTwitchUser.displayName : `${userTwitchUser.displayName} (${userTwitchUser.name})`;
  const discordUser = submission.user.connections.discord;
  let category = submission.category;
  if (submission.runType !== 'solo') {
    category += ` (${submission.runType})`;
  }
  privateWebhook({
    title: `A run has been ${changeType}!`,
    url: `${settings.frontend.baseurl}${settings.vue.mode === 'history' ? '' : '#/'}dashboard/submissions/${submission._id}`,
    description: `${userTwitchName} has just ${changeType} a run!\n\n` // eslint-disable-line prefer-template
    + `**Submit by:** ${submitterTwitchName}\n`
    + (discordUser ? `**Discord user:** <@${discordUser.id}> (${discordUser.name}#${discordUser.discriminator})\n` : '')
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}\n`
    + `**Estimate:** ${submission.estimate}\n`
    + `**Runners:** ${submission.runners}\n`
  });
  if (changeType === 'accepted') {
    publicWebhook({
      title: `A run has been ${changeType}!`,
      url: `${settings.frontend.baseurl}${settings.vue.mode === 'history' ? '' : '#/'}dashboard/submissions/${submission._id}`,
      description: `**Submit by:** ${submitterTwitchName}\n`
    + `**Game:** ${submission.game}\n`
    + `**Category:** ${category}\n`
    + `**Platform:** ${submission.platform}\n`
    + `**Runners:** ${submission.runners}\n`
    });
  }
}
