import URL from 'url';
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
      const tokenResponse = await httpPost('https://id.twitch.tv/oauth2/token', {
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
      const userResponse = await twitchGet('https://api.twitch.tv/helix/users', null, token);
      console.log('User response:', userResponse);
      if(!userResponse || !userResponse.data || userResponse.data.length === 0) {
        res.status(404).end(`User not found`);
        return
      }
      const userData = userResponse.data[0];
      if (userData && userData.id) {
        // get user
        let user = await models.User.findOne({ 'connections.twitch.id': userData.id }).exec();
        if (!user) {
          user = new models.User({
            connections: {
              twitch:
              {
                name: userData.login,
                displayName: userData.display_name,
                id: userData.id,
                logo: userData.profile_image_url,
                email: userData.email,
                oauthToken: token,
                refreshToken: tokenResponse.refresh_token,
                expiresAt: Date.now() + tokenResponse.expires_in * 1000
              }
            },
            flag: (req.header['CF-IPCountry'] || 'XX').toLowerCase()
          });
          console.log('Created new user', user);
        } else {
          if (user.connections.twitch.name !== userData.login) {
            user.connections.twitch.name = userData.login;
            logger.info(`User ${user.connections.twitch.name} (id: ${userData.id}) changed their name to ${userData.login}`);
          }
          user.connections.twitch.displayName = userData.display_name;
          user.connections.twitch.logo = userData.profile_image_url;
          if (user.connections.twitch.email !== userData.email) {
            user.connections.twitch.email = userData.email;
            logger.info(`User ${user.connections.twitch.name} (id: ${userData.id}) changed their email to ${userData.email}`);
          }
          user.connections.twitch.oauthToken = token;
          user.connections.twitch.refreshToken = tokenResponse.refresh_token;
          user.connections.twitch.expiresAt = Date.now() + tokenResponse.expires_in * 1000;
          console.log('Updated user', user);
        }

        console.log('Default Admins:', settings.defaultAdmins);
        if (settings.defaultAdmins.includes(userData.id) && user.roles.length === 0) {
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

        const jwt = generateToken(token, { twitchID: userData.id, name: user.name, id: user._id });
        res.cookie('esa-jwt', jwt, settings.auth.cookieOptions);

        console.log('Redirecting to', redirectUrl);
        res.redirect(redirectUrl);
      } else {
        res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?twitch_linked=0&error=Invalid%20data%20returned%20`);
      }
      return
    }
    res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?twitch_linked=0&error=CSRF%20Token%20invalid`);
    return;
  } catch (err) {
    console.error(err);
    logger.error(err);
    res.redirect(redirectUrl);
  }
}
