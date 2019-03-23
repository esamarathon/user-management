<template>
  <div class="layout-column profile-info">
    <h1>User profile</h1>
    <form class="profile-details layout-column" v-if="user">
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">Name</div>
        <div class="flex">{{user.connections.twitch.displayName}}</div>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">E-Mail</div>
        <div class="flex">{{user.connections.twitch.email}}</div>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">Twitter handle</div>
        <md-field class="flex-10 very-compact md-dark">
          <span class="md-prefix">@</span>
          <md-input v-model="twitterHandle" v-on:change="twitterUpdated"></md-input>
        </md-field>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">Phone number</div>
        <md-field class="flex-10 very-compact md-dark">
          <md-input type="tel" autocomplete="tel" v-model="phoneNumber" v-on:change="phoneUpdated"></md-input>
        </md-field>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">Flag</div>
        <div class="flex"><flags-dropdown :selected="user.flag" v-on:change="flagSelected"></flags-dropdown></div>
      </div>
      <div class="details-row layout-row button-equivalent" v-if="!user.connections.discord">
        <md-button class="md-dark" :href="discordAuthUrl"><img class="logo" src="../../assets/discord_logo.png"> Connect with Discord</md-button>
      </div>
      <div class="details-row layout-row button-equivalent" v-if="user.connections.discord">
        <div class="layout-column discord-connection md-elevation-2 layout-padding">
          <div class="layout-row layout-between-center">
            <div class="flex-none">
              <img class="big-logo" src="../../assets/discord_logo_blue.png"><span class="discord-username">{{user.connections.discord.name}}</span><span class="discord-discriminator">#{{user.connections.discord.discriminator}}</span>
            </div>
            <div class="flex-none">
              <md-button class="md-dark md-icon-button" @click="discordLogout()"><md-icon>close</md-icon></md-button>
            </div>
          </div>
          <div class="layout-row layout-between-center">
            <span>Display on profile</span>
            <div>
              <md-switch v-model="user.connections.discord.public" @change="discordPublicUpdated()"></md-switch>
            </div>
          </div>
        </div>
      </div>
      <!--<div class="details-row layout-row">
        <md-button class="md-dark"><img class="logo" src="../../assets/speedrun_com_logo_flat.png"> Connect with Speedrun.com</md-button>
      </div>-->
    </form>
  </div>
</template>

<script src="./profile.js">
</script>

<style lang="scss">
@import url('../../../node_modules/flags-dropdown-vue/css/custom.css');
@import url('../../../node_modules/flags-dropdown-vue/css/flags.min.css');

.lang-dropdown {
  .flag-box {
    border: none !important;
    background-image: url('../../assets/dropdown-arrow.png') !important;
  }

  .lang-dropdown-content {
    background-color: #333;
    z-index: 80;
    li {
      cursor: pointer;
    }
  }
}

.details-row {
  &.button-equivalent {
    padding: 8px 16px;

    .flex-10 {
      min-width: 200px;
    }
  }
}

img.logo {
  height: 24px;
  margin-right: 8px;
}

img.big-logo {
  height: 2em;
  margin-right: 8px;
}

.button-align {
  padding: 0 8px;
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

.md-dark {
  &.md-button.md-theme-default {
    &:not([disabled]) {
      color: white;
    }
  }

  &.md-field.md-theme-default, &.md-field.md-theme-default.md-focused, &.md-field.md-theme-default.md-has-value {
    .md-prefix, .md-input {
      color: white;
      -webkit-text-fill-color: initial;
    }
  }
}

.discord-connection {
  width: 20%;
  min-width: 400px;
  background-color: #2C2F33;
}

.discord-discriminator {
  color: rgba(255,255,255,0.5);
  font-size: small;
}
</style>
