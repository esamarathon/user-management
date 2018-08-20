<template>
  <div class="layout-column profile-info">
    <div class="profile-setting">Name: {{user.name}}</div>
    <div class="profile-setting">Email: {{user.email}}</div>
    <div class="profile-setting">Flag: <flags-dropdown :selected="user.flag" v-on:change="flagSelected"></flags-dropdown></div>
    <profile-connection class="twitch-connect" type="twitch" :info="user.twitch"></profile-connection>
    <profile-connection class="discord-connect" type="discord" :info="user.discord"></profile-connection>
    <profile-connection class="speedrun-connect" type="speedrun" :info="user.speedrun"></profile-connection>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data: () => ({
    user: { // this will be moved to vuex eventually
      name: 'CBenni',
      email: 'memes@cbenni.com',
      flag: 'de',
      twitch: {
        id: '21018440',
        name: 'cbenni',
        displayName: 'CBenni',
      },
      discord: null,
      speedrun: null,
    },
  }),
  methods: {
    flagSelected(selected) {
      this.user.flag = selected.iso;
    },
  },
};
</script>

<style lang="scss">
@import url('flags-dropdown-vue/css/custom.css');
@import url('flags-dropdown-vue/css/flags.min.css');

.lang-dropdown-content {
  background-color: #333;
  z-index: 80;
}
</style>
