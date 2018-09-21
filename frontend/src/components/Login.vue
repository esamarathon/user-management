<template>
  <div class="flex-100 layout-column layout-center-center login-background">
    <md-card class="login-overlay layout-column layout-start-center layout-padding">
      <md-card-media>
        <img src="../assets/esa-logo.png" alt="ESA logo" class="esa-logo">
      </md-card-media>
      <md-card-header>
        <div class="md-title">ESA login</div>
      </md-card-header>
      <md-card-content class="layout-row layout-center-center">
        <md-button class="twitch-login" @click="login">Log in with twitch</md-button>
      </md-card-content>
    </md-card>
  </div>
</template>

<script src="./login.js">
</script>

<style lang="scss">
.login-background {
  background-image: url('../assets/background.png');
  background-size: cover;
}

.login-overlay.md-card.md-theme-default {
  padding: 16px;
  border-radius: 5px;
  background-color: rgba(0,0,0,0.8);
  color: white;

  img.esa-logo {
    width: 300px;
  }
}
.md-button.md-theme-default.twitch-login {
  background-color: #6441A4;
  color: white;
  border-radius: 5px;
}
</style>
