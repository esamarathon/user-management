import { decodeToken } from '../auth';
import { httpPost, httpReq } from '../helpers';
import settings from '../settings';
import logger from '../logger';
import { historySep } from './helpers';
import { models } from '../models';

export async function handleDiscordLogin(req, res) {
  // check if the jwt is set as a cookie (!)
  const jwtCookie = req.cookies['esa-jwt'];
  let jwt;
  try {
    jwt = decodeToken(jwtCookie);
  } catch (err) {
    return res.status(401).end('Not authenticated');
  }
  // check the csrf token against the state
  try {
    if (req.cookies['discord-csrf'] && req.cookies['discord-csrf'] === req.query.state) {
      res.clearCookie('discord-csrf');
      // get the oauth token for discord
      logger.debug('Loggin in to discord...');
      const tokenResponse = await httpPost('https://discordapp.com/api/oauth2/token', {
        body: {
          client_id: settings.discord.clientID,
          client_secret: settings.discord.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: `${settings.api.baseurl}discord`,
          code: req.query.code,
          state: req.query.state
        }
      });
      console.log('tokenResponse:', tokenResponse);
      const token = tokenResponse.access_token;
      if (!token) throw new Error('Invalid token');
      const userResponse = await httpReq('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Discord user response:', userResponse);
      const user = await models.User.findById(jwt.user.id);
      user.connections.discord = {
        id: userResponse.id,
        name: userResponse.username,
        discriminator: userResponse.discriminator,
        avatar: userResponse.avatar,
        public: true,
        oauthToken: token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: Date.now() + tokenResponse.expires_in * 1000
      };
      await user.save();
      return res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?discord_linked=1`);
    }
    return res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?discord_linked=0&error=CSRF%20Token%20invalid`);
  } catch (err) {
    return res.redirect(`${settings.frontend.baseurl}${historySep}dashboard/profile?discord_linked=0&error=${encodeURIComponent(err.toString())}`);
  }
}


export async function handleDiscordLogout(req, res) {
  if (!req.jwt) return res.status(401).end('Not authenticated.');
  const user = await models.User.findById(req.jwt.user.id, 'connections');
  user.connections.discord = null;
  await user.save();
  return res.json({ success: true });
}
