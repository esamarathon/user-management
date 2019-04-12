// TODO: refactor into standalone, rabbitmq-powered service
import _ from 'lodash';
import { models } from './models';
import logger from './logger';
import { httpPost, renderTemplate, frontendUrl } from './helpers';
import settings from './settings';
import emailTemplate from './emailTemplate';
import { generateUnsubscribeToken } from './auth';

function sendNotificationEmail(user, options) {
  if (!settings.email || !settings.email.postUrl) throw new Error('Mail provider settings missing!');

  const templateParams = _.merge({
    user,
    email: user.connections.twitch.email,
    profileUrl: frontendUrl('dashboard/profile'),
    unsubscribeUrl: frontendUrl(`unsubscribe?jwt=${generateUnsubscribeToken(user)}`)
  }, options.data);
  const html = renderTemplate(emailTemplate, templateParams);

  httpPost(settings.email.postUrl, _.merge({}, settings.email.options, {
    body: {
      to: user.connections.twitch.email,
      subject: options.subject,
      html
    }
  }));
}

export async function sendNotification(user, options) {
  let notificationSettings = user.toObject().notificationSettings;
  if (!notificationSettings) {
    user = await models.User.findById(user._id || user);
    if (user) notificationSettings = user.notificationSettings;
  }
  if (!notificationSettings) {
    logger.error('No notification settings found for ', user);
    return;
  }
  // type is one of product, submissions, volunteering, tickets, donations, onsite, favourites
  if (notificationSettings[options.type].email) {
    sendNotificationEmail(user, options);
  }
}
