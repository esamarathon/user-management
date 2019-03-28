<template>
  <div class="team layout-column">
    <div class="header">
      <md-field class="small-field flex-none">
        <label for="teamname">Team name</label>
        <md-input name="teamname" id="teamname" v-model="info.name" @change="update()" />
      </md-field>
    </div>
    <div class="members layout-column">
      <span class="compact-title">Members:</span>
      <draggable v-model="info.members" group="members" class="test" tag="div">
        <div class="member" v-for="member in info.members" :key="member._id" :class="member.status">
          <img :src="member.user.connections.twitch.logo" class="profilepic invitation"> {{member.user.connections.twitch.displayName}}
        </div>
      </draggable>
      <!-- <div class="member" v-for="member in info.members" :key="member._id">
        <img :src="member.name" class="profile-pic"> {{member.name}}
      </div>
      <md-button :click="addMember()">Add team member</md-button>-->
    </div>
  </div>
</template>

<script src="./team.js">
</script>

<style lang="scss" scoped>
.team {

  .header {
    padding: 8px;
    background-color: rgba(0,0,0,0.2);

    input {
      font-size: large;
    }
  }

  .members {
    .compact-title {
      font-size: large;
    }

    padding: 8px;
  }
}
</style>
