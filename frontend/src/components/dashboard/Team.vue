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
      <div class="member" v-for="member in info.members" :key="member._id">
        <md-autocomplete md-input-placeholder="Twitch name" class="compact" v-model="member.name" :md-options="usernameSearch" @md-changed="searchUsernames(member.name)" @md-selected="ensureEmptyRow()">
          <template slot="md-autocomplete-item" slot-scope="{ item }">{{ item }}</template>
        </md-autocomplete>
      </div>
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
