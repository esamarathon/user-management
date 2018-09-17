import got from 'got';
import URL from 'url';

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
      let user = await models.User.findOne({ 'connections.twitch.id': userResponse.id }).exec();
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
          }
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

export function handleLogout(req, res) {
  if (req.token && req.cookies && req.cookies.token && req.token === req.cookies.token) {
    const frontendUrl = URL.parse(settings.frontend.baseurl);
    const allowedOrigin = `${frontendUrl.protocol}//${frontendUrl.host}`;
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', true);
    res.clearCookie('esa-jwt');
  } else {
    res.status(400).jsonp({ error: 'Missing, mismatching or invalid token' });
  }
}
