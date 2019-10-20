import settings from '../settings';
import { httpPost } from '../helpers';
import logger from '../logger';
import { twitchGet } from '../twitchAPI';
import { models } from '../models';
import { generateToken } from '../auth';
import { historySep } from './helpers';


export async function handleLogin(req, res) {
  const [csrf, redirect] = req.query.state.split(' ');
  const redirectUrl = decodeURIComponent(redirect || '') || settings.frontend.baseurl;
  const parsedRedirectUrl = URL.parse(redirectUrl);
  const domainFilter = new RegExp(settings.auth.domainFilter);
  if (!domainFilter.test(parsedRedirectUrl.hostname)) {
    res.status(403).end(`Invalid redirect URL: ${parsedRedirectUrl.hostname}!`);
    return;
  }
  try {
    if (req.cookies['esa-csrf'] && req.cookies['esa-csrf'] === csrf) {
      res.clearCookie('esa-csrf');
      logger.debug('Logging in...');
      const tokenResponse = await httpPost('https://api.twitch.tv/kraken/oauth2/token', {
        body: {
          client_id: settings.twitch.clientID,
          client_secret: settings.twitch.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: `${settings.api.baseurl}login`,
          code: req.query.code,
          state: req.query.state
        }
      });
      const token = tokenResponse.access_token;
      if (!token) throw new Error('Access token could not be received');
      const userResponse = await twitchGet('https://api.twitch.tv/kraken/user', null, token);
      console.log('User response:', userResponse);
      if (userResponse && userResponse._id) {
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
                refreshToken: tokenResponse.refresh_token,
                expiresAt: Date.now() + tokenResponse.expires_in * 1000
              }
            },
            flag: (req.header['CF-IPCountry'] || 'XX').toLowerCase()
          });
          console.log('Created new user', user);
        } else {
          if (user.connections.twitch.name !== userResponse.name) {
            user.connections.twitch.name = userResponse.name;
            logger.info(`User ${user.connections.twitch.name} (id: ${userResponse._id}) changed their name to ${userResponse.name}`);
          }
          user.connections.twitch.displayName = userResponse.display_name;
          user.connections.twitch.logo = userResponse.logo;
          if (user.connections.twitch.email !== userResponse.email) {
            user.connections.twitch.email = userResponse.email;
            logger.info(`User ${user.connections.twitch.name} (id: ${userResponse._id}) changed their email to ${userResponse.email}`);
          }
          user.connections.twitch.oauthToken = token;
          user.connections.twitch.refreshToken = tokenResponse.refresh_token;
          user.connections.twitch.expiresAt = Date.now() + tokenResponse.expires_in * 1000;
          console.log('Updated user', user);
        }

        console.log('Default Admins:', settings.defaultAdmins);
        if (settings.defaultAdmins.includes(userResponse._id) && user.roles.length === 0) {
          const adminRole = await models.Role.findOne({ permissions: '*' }).exec();
          if (adminRole) {
            logger.info('Making user', user, 'an admin!');
            user.roles.push({
              event: null,
              role: adminRole
            });
          } else {
            logger.error('Tried to make', user, 'an admin, but no admin role exists!');
          }
        }

        await user.save();

        const jwt = generateToken(token, { twitchID: userResponse._id, name: user.name, id: user._id });
        res.cookie('esa-jwt', jwt, settings.auth.cookieOptions);

        console.log('Redirecting to', redirectUrl);
        res.redirect(redirectUrl);
        return;
      }
      res.redirect(redirectUrl);
      return;
    }
    res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?twitch_linked=0&error=CSRF%20Token%20invalid`);
    return;
  } catch (err) {
    console.error(err);
    logger.error(err);
    res.redirect(redirectUrl);
  }
}
