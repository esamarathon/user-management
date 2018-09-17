import settings from '../settings';

export default {
  name: 'Login',
  methods: {
    login() {
      const url = `https://id.twitch.tv/oauth2/authorize?client_id=${settings.twitch.clientID}` +
        `&redirect_uri=${encodeURIComponent(`${settings.api.baseurl}login`)}` +
        '&response_type=code&scope=user_read';
      console.log('Redirecting to', url);
      window.location.href = url;
    },
  },
};
