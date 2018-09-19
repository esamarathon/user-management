<template>
  <div class="layout-column profile-info">
    <h1>User profile</h1>
    <div class="profile-details layout-column" v-if="user">
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">Name</div>
        <div class="flex">{{user.connections.twitch.displayName}}</div>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">E-Mail</div>
        <div class="flex">{{user.connections.twitch.email}}</div>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-10">Flag</div>
        <div class="flex"><flags-dropdown :selected="user.flag" v-on:change="flagSelected"></flags-dropdown></div>
      </div>
      <div class="details-row layout-row">
        <div class="button-align"><img class="logo" src="../../assets/twitch_logo.png"> Connected as {{user.connections.twitch.displayName}}</div>
      </div>
      <div class="details-row layout-row">
        <md-button class="md-dark"><img class="logo" src="../../assets/discord_logo.png"> Connect with Discord</md-button>
      </div>
      <div class="details-row layout-row">
        <md-button class="md-dark"><img class="logo" src="../../assets/speedrun_com_logo_flat.png"> Connect with Speedrun.com</md-button>
      </div>
    </div>
  </div>
</template>

<script src="./profile.js">
</script>

<style lang="scss">
@import url('flags-dropdown-vue/css/custom.css');
@import url('flags-dropdown-vue/css/flags.min.css');

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
  }
}

img.logo {
  height: 24px;
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

.md-dark, .md-button.md-dark.md-theme-default, .md-dark .md-icon.md-theme-default.md-icon-font {
  color: white;
}
</style>
