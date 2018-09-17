<template>
  <div class="layout-column profile-info">
    <h1>User profile</h1>
    <div class="profile-details layout-column">
      <div class="details-row button-equivalent layout-row">
        <div class="flex-25">Name</div>
        <div class="flex">{{user.name}}</div>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-25">E-Mail</div>
        <div class="flex">{{user.email}}</div>
      </div>
      <div class="details-row button-equivalent layout-row">
        <div class="flex-25">Flag</div>
        <div class="flex"><flags-dropdown :selected="user.flag" v-on:change="flagSelected"></flags-dropdown></div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25"><profile-connection class="twitch-connect" type="twitch" :info="user.twitch"></profile-connection></div>
      </div>
      <div class="details-row layout-row">
        <profile-connection class="discord-connect" type="discord" :info="user.discord"></profile-connection>
      </div>
      <div class="details-row layout-row">
        <profile-connection class="speedrun-connect" type="speedrun" :info="user.speedrun"></profile-connection>
      </div>
    </div>
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
</style>
