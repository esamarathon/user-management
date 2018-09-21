import got from 'got';
import URL from 'url';
import _ from 'lodash';

import logger from './logger';
import { twitchGet } from './twitchAPI';
import settings from './settings';
import { generateToken } from './auth';
import { models } from './models';

export async function handleLogin(req, res, next) {
  const redirectUrl = req.query.state || settings.frontend.baseurl;
  const parsedRedirectUrl = URL.parse(redirectUrl);
  const domainFilter = new RegExp(settings.auth.domainFilter);
  if (!domainFilter.test(parsedRedirectUrl.hostname)) {
    res.status(403).end('Invalid redirect URL!');
    return;
  }
  try {
    logger.debug('Logging in...');
    const tokenResponse = await got.post('https://api.twitch.tv/kraken/oauth2/token', {
      form: true,
      body: {
        client_id: settings.twitch.clientID,
        client_secret: settings.twitch.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: `${settings.api.baseurl}login`,
        code: req.query.code,
        state: req.query.state
      },
      json: true
    });
    const token = tokenResponse.body.access_token;
    console.log('Token:', token);
    const userResponse = (await twitchGet('https://api.twitch.tv/kraken/user', null, token)).body;
    console.log('User response:', userResponse);
    if (userResponse) {
      const jwt = generateToken(token, { id: userResponse._id, login: userResponse.name, displayName: userResponse.display_name });

      // get user
      let user = await models.User.findOne({ 'connections.twitch.id': userResponse._id }).exec();
      if (!user) {
        user = new models.User({
          connections: {
            twitch:
            {
              name: userResponse.name,
              displayName: userResponse.display_name,
              id: userResponse._id,
              logo: userResponse.logo,
              email: userResponse.email,
              oauthToken: token,
              refreshToken: tokenResponse.body.refresh_token,
              expiresAt: Date.now() + tokenResponse.body.expires_in * 1000
            }
          },
          flag: (req.header['CF-IPCountry'] || 'XX').toLowerCase()
        });
        console.log('Created new user', user);
      } else {
        user.connections.twitch.name = userResponse.name;
        user.connections.twitch.displayName = userResponse.display_name;
        user.connections.twitch.logo = userResponse.logo;
        user.connections.twitch.email = userResponse.email;
        user.connections.twitch.oauthToken = token;
        user.connections.twitch.refreshToken = tokenResponse.body.refresh_token;
        user.connections.twitch.expiresAt = Date.now() + tokenResponse.body.expires_in * 1000;
        console.log('Updated user', user);
      }
      await user.save();

      res.cookie('esa-jwt', jwt, settings.auth.cookieOptions);

      console.log('Redirecting to', redirectUrl);
      res.redirect(redirectUrl);
    }
    res.status(402).end('Invalid authentication');
  } catch (err) { logger.error(err); next(err); }
}


export async function getUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  console.log('Getting user with ID ', req.jwt.user.id);
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id })
  .populate('roles')
  .populate('submissions')
  .populate('applications')
  .exec();
  if (user) {
    return res.json(user);
  }
  return res.status(404).end('User not found.');
}

const allowedUserModifications = ['flag'];
export async function updateUser(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findOne({ 'connections.twitch.id': req.jwt.user.id }).populate('roles').exec();
  if (user) {
    console.log('Request body: ', req.body);
    const badChange = _.find(req.body, (value, property) => {
      if (allowedUserModifications.includes(property)) {
        _.set(user, property, value);
      } else {
        res.status(400).end(`Invalid property ${property}`);
        return true;
      }
      return false;
    });
    if (badChange) return res;
    user.save();
    return res.json(user);
  }
  return res.status(404).end('User not found.');
}

export async function getEvent(req, res) {
  if (req.params.event) return res.json(await models.Event.find({ identifier: req.params.event }));
  return res.json(await models.Event.find());
}
