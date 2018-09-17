<template>
  <div class="layout-column">
    <div class="flex-none layout-row" v-if="info">
      <md-button class="md-icon-button md-dark"><md-icon>close</md-icon></md-button>
      <div class="button-align"><img class="logo" :src="config.logo"> Connected as {{info.displayName}}</div>
    </div>
    <div class="flex-none layout-row" v-if="!info">
      <md-button class="md-dark"><img class="logo" :src="config.logo"> Connect with {{config.displayName}}</md-button>
    </div>
  </div>
</template>

<script>
import settings from '../../settings';
import twitchLogo from '../../assets/twitch_logo.png';
import discordLogo from '../../assets/discord_logo.png';
import speedrunLogo from '../../assets/speedrun_com_logo_flat.png';

const config = {
  twitch: {
    logo: twitchLogo,
    authURL: `https://id.twitch.tv/oauth2/authorize?client_id=${settings.twitch.clientID}` +
      `&redirect_uri=${encodeURIComponent(`${settings.api.baseurl}login/twitch`)}` +
      '&response_type=code&scope=',
    displayName: 'twitch',
  },
  discord: {
    logo: discordLogo,
    displayName: 'discord',
  },
  speedrun: {
    logo: speedrunLogo,
    displayName: 'speedrun.com',
  },
};

export default {
  name: 'ProfileConnection',
  props: {
    type: String,
    info: Object,
  },
  computed: {
    config() {
      return config[this.type];
    },
  },
};
</script>

<style lang="scss" scoped>
.logo {
  height: 24px;
  margin-right: 8px;
}

.button-align {
  height: 36px;
  margin: 6px 8px;
  user-select: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
  position: relative;
  overflow: hidden;
  outline: none;
  background: transparent;
  border: 0;
  font-family: inherit;
  line-height: normal;
  text-decoration: none;
  vertical-align: top;
  white-space: nowrap;
}

.md-dark, .md-dark .md-icon.md-theme-default.md-icon-font {
  color: white;
}
</style>
