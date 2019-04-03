<template>
  <div class="dashboard flex-100 layout-column">
    <md-toolbar class="header layout-row layout-between layout-padding md-primary" md-theme="header">
      <div class="flex left-menu layout-row">
        <div class="esa-logo"><img src="../assets/esa-logo.png"></div>
        <div class="flex event-selector">
          <md-field class="compact">
            <label for="event">Event</label>
            <md-select v-model="currentEventID" name="event" id="event">
              <md-option v-for="possibleEvent in eventList" :value="possibleEvent._id" :key="possibleEvent._id">{{possibleEvent.name}}</md-option>
            </md-select>
          </md-field>
        </div>
      </div>
      <div class="flex-none">
        <md-button class="md-primary md-raised twitch-login" :to="{name: 'Login'}">Log in</md-button>
      </div>
    </md-toolbar>
    <div class="wrapper layout-row layout-start-stretch flex-100">
      <div class="content flex-100 layout-padding layout-column">
        <public-submissions></public-submissions>
      </div>
    </div>
  </div>
</template>

<script src="./public.js">
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.header {

  .user-info {
    background-color: #555;
    border-radius: 5px 0 0 5px;
    padding-left: 8px;
    height: 36px;
    cursor: pointer;

    .profile-pic {
      height: 36px;
      width: 36px;
      margin-left: 8px;
      margin-right: 0;
    }
  }
}

.header .md-button.md-theme-header.md-raised.twitch-login {
  background-color: #6441A4;
  color: white;
  border-radius: 5px;
}

.event-selector {
  max-width: 200px;
}

.esa-logo, .esa-logo img {
  height: 48px;
  margin-right: 8px;
}
</style>
