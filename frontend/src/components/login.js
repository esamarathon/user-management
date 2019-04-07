import settings from '../settings';
import { generateID, setCookie } from '../helpers';

export default {
  name: 'Login',
  data: () => ({
    gdpr: false,
  }),
  methods: {
    login() {
      if (!this.gdpr) return;
      let stateToken = generateID();
      setCookie('esa-csrf', stateToken, 15 * 60 * 1000);
      if (this.$route.query.redirect) stateToken += `+${encodeURIComponent(this.$route.query.redirect)}`;
      const url = `https://id.twitch.tv/oauth2/authorize?client_id=${settings.twitch.clientID}`
        + `&redirect_uri=${encodeURIComponent(`${settings.api.baseurl}login`)}`
        + `&response_type=code&scope=user_read&state=${stateToken}`;
      console.log('Redirecting to', url);
      window.location.href = url;
    },
  },
};
