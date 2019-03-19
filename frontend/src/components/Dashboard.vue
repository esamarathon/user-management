<template>
  <div class="dashboard flex-100 layout-column">
    <md-toolbar class="header layout-row layout-between layout-padding md-primary" md-theme="header">
      <div class="menu-button flex-none layout-row">
        <md-menu md-direction="bottom-end" class="menu-button">
          <md-button md-menu-trigger class="md-icon-button">
            <md-icon>menu</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="logout()">Log out</md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-field class="compact">
          <label for="event">Event</label>
          <md-select v-model="currentEventID" name="event" id="event">
            <md-option v-for="possibleEvent in eventList" :value="possibleEvent._id" :key="possibleEvent._id">{{possibleEvent.name}}</md-option>
          </md-select>
        </md-field>
      </div>
      <div class="flex-none">
        <div class="user-info flex-none">
          {{(user && user.connections.twitch.displayName) || ''}}
          <img class="profile-pic" :src="(user && user.connections.twitch.logo) || ''">
        </div>
      </div>
    </md-toolbar>
    <div class="wrapper layout-row layout-start-stretch flex-100">
      <div class="navigation flex-none layout-padding layout-column" :class="{collapsed: collapseNav}">
        <md-button class="collapse-nav md-icon-button flex-none" @click="collapseNav = !collapseNav">
          <md-icon>slideshow</md-icon>
        </md-button>
        <md-list class="flex">
          <md-list-item :to="{name:'Home'}">
            <md-icon>home</md-icon>
            <span class="md-list-item-text">Home</span>
          </md-list-item>

          <md-list-item :to="{name:'Profile'}">
            <md-icon>settings</md-icon>
            <span class="md-list-item-text">Profile</span>
          </md-list-item>

          <md-list-item :to="{name:'Submissions'}">
            <md-icon>send</md-icon>
            <span class="md-list-item-text">Submissions</span>
          </md-list-item>

          <md-list-item :to="{name:'Applications'}">
            <md-icon>how_to_reg</md-icon>
            <span class="md-list-item-text">Volunteer</span>
          </md-list-item>

          <md-subheader v-if="hasAnyPermission()">Administration</md-subheader>
          <md-list-item v-if="hasAnyPermission('Manage Roles', 'Admin')" :to="{name:'Roles'}">
            <md-icon>security</md-icon>
            <span class="md-list-item-text">Roles</span>
          </md-list-item>
          <md-list-item v-if="hasAnyPermission('Edit Users', 'Admin')" :to="{name:'Users'}">
            <md-icon>people</md-icon>
            <span class="md-list-item-text">Users</span>
          </md-list-item>
          <md-list-item v-if="hasAnyPermission('Approve Submissions', 'Admin')" :to="{name:'Runs'}">
            <md-icon>games</md-icon>
            <span class="md-list-item-text">Runs</span>
          </md-list-item>
          <md-list-item v-if="hasAnyPermission('Approve Volunteers', 'Admin')" :to="{name:'Volunteers'}">
            <md-icon>ballot</md-icon>
            <span class="md-list-item-text">Volunteers</span>
          </md-list-item>
          <md-list-item v-if="hasAnyPermission('Manage Events', 'Admin')" :to="{name:'Events'}">
            <md-icon>event</md-icon>
            <span class="md-list-item-text">Events</span>
          </md-list-item>
        </md-list>
      </div>
      <div class="content flex-100 layout-padding layout-column">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script src="./dashboard.js">
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.header {

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

  .collapse-nav {
    align-self: flex-end;
  }

  &:not(.collapsed) {
    .collapse-nav {
      transform: rotate(180deg);
    }
  }

  &.collapsed {
    width: 72px;

    .md-subheader {
      text-indent: -999px;
      border-bottom: 1px solid rgba(255,255,255,0.7);
      max-height: 1px;
      min-height: 0px;
    }
  }

  .md-list{
    background-color: transparent;
  }
}

@media screen and (max-width: 1000px) {
  .navigation {
    width: 73px;
  }
}

.menu-button {
  margin-right: 12px;
}
</style>
