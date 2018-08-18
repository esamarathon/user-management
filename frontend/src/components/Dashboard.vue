<template>
  <div class="dashboard flex-100 layout-column">
    <div class="header layout-row layout-between layout-padding">
      <div class="menu-button flex-none">
        <md-menu md-direction="bottom-end">
          <md-button md-menu-trigger class="md-icon-button">
            <md-icon>menu</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="logout()">Log out</md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
      <div class="flex-none">
        <div class="user-info flex-none">
          {{(user && user.displayName) || ''}}
          <img class="profile-pic" :src="(user && user.logo) || ''">
        </div>
      </div>
    </div>
    <div class="wrapper layout-row layout-start-stretch flex-100">
      <div class="navigation flex-none layout-padding">
        <md-list>
          <md-list-item>
            <md-icon>settings</md-icon>
            <span class="md-list-item-text">Profile</span>
          </md-list-item>

          <md-list-item>
            <md-icon>send</md-icon>
            <span class="md-list-item-text">Submissions</span>
          </md-list-item>

          <md-list-item>
            <md-icon>how_to_reg</md-icon>
            <span class="md-list-item-text">Volunteer</span>
          </md-list-item>

          <md-list-item>
            <md-icon>info</md-icon>
            <span class="md-list-item-text">Information</span>
          </md-list-item>
        </md-list>
      </div>
      <div class="content flex-100 layout-padding">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data: () => ({
    user: {
      displayName: "CBenni",
      logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/cbenni-profile_image-99d37ad0e11bcb85-300x300.jpeg"
    }
  }),
  methods: {
    logout() {

    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.dashboard {

}

.header {
  background-color: #448aff;

  .user-info {
    background-color: #555;
    border-radius: 5px 0 0 5px;
    padding-left: 8px;
    height: 36px;

    .profile-pic {
      height: 36px;
      width: 36px;
      margin-left: 8px;
      margin-right: 0;
    }
  }
}

.navigation {
  border-right: 1px solid;
  border-right-color: rgba(0,0,0,0.22);
  width: 280px;
  background-color: #1F2741;
  transition: width 0.1s;

  .md-list{
    background-color: transparent;
    color: white;

    & * {
      color: inherit !important;
    }
  }
}

@media screen and (max-width: 1000px) {
  .navigation {
    width: 73px;
  }
}

.content {
}
</style>
