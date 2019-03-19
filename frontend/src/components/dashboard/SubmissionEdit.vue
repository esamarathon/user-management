<template>
  <form v-if="selectedSubmission" class="layout-padding">
    <div class="layout-row layout-wrap">
      <md-field class="large-field flex-none">
        <label for="game">Game</label>
        <md-input name="game" id="game" v-model="selectedSubmission.game" />
      </md-field>
      <md-field class="small-field flex-none">
        <label for="category">Category</label>
        <md-input name="category" id="category" v-model="selectedSubmission.category" />
      </md-field>
      <md-field class="small-field flex-none">
        <label for="estimate">Estimate</label>
        <md-input name="estimate" id="estimate" v-model="selectedSubmission.estimate" />
      </md-field>
      <md-autocomplete class="small-field" v-model="selectedSubmission.platform" :md-options="platforms">
        <label>Platform</label>
        <template slot="md-autocomplete-item" slot-scope="{ item }">{{ item }}</template>
      </md-autocomplete>
      <md-field class="small-field flex-none">
        <label for="runType">Run type</label>
        <md-select v-model="selectedSubmission.runType" name="runType" id="runType" @md-selected="initTeams()">
          <md-option value="solo">Solo</md-option>
          <md-option value="coop">Co-op</md-option>
          <md-option value="race">Race</md-option>
          <md-option value="relay">Relay</md-option>
        </md-select>
      </md-field>
      <div class="team-setup flex-100 layout-column" v-if="selectedSubmission.runType !== 'solo'">
        <h3>Team setup</h3>
        <span>
          <strong>NOTE:</strong>
          <span>For a co-op, relay or race run, only a single runner shall submit the run. Submit the twitch usernames of the other runners below to invite them and drag and drop them into their respective teams.
            Please ask them to sign in to the dashboard once you have saved your run.
          </span>
        </span>
        <div class="layout-row">
          <md-autocomplete md-input-placeholder="Twitch name" class="" v-model="userToAdd" :md-options="usernameSearch" @md-changed="searchUsernames(userToAdd)">
            <template slot="md-autocomplete-item" slot-scope="{ item }" @click="selectUser(item)"><span><img :src="twitchUserCache[item].logo" class="profilepic"> {{ item }}</span></template>
          </md-autocomplete>
          <md-button @click="inviteUser()">Send invite</md-button>
        </div>
        <draggable v-model="selectedSubmission.invitations" group="members">
          <div class="member" v-for="invitation in selectedSubmission.invitations" :key="invitation._id">
            <img :src="invitation.user.connections.twitch.logo" class="profilepic"> {{invitation.user.connections.twitch.displayName}}
          </div>
        </draggable>

        <div class="layout-wrap layout-row" v-if="selectedSubmission.teams">
          <div class="team-wrapper flex-50" v-for="team in selectedSubmission.teams" :key="team._id">
            <team :info="team"></team>
          </div>
          <div class="team-wrapper flex-50 layout-row layout-center-center">
            <div class="flex-none">
              <md-button class="md-icon-button flex-none huge-add-button" @click="addTeam()"><md-icon>add</md-icon></md-button>
            </div>
          </div>
        </div>
      </div>
      <md-field class="large-field flex-none">
        <label for="video">Video url</label>
        <md-input name="video" id="video" v-model="selectedSubmission.video" />
      </md-field>
      <md-field class="large-field flex-100">
        <md-textarea name="comment" id="comment" v-model="selectedSubmission.description" placeholder="Game description (e.g. explanation of the basic concept, things you would like to be pointed out by the hosts, ...)" />
      </md-field>
      <md-field class="large-field flex-100">
        <md-textarea name="comment" id="comment" v-model="selectedSubmission.comment" placeholder="Comment (e.g. why you are worthy, special requests, ...)" />
      </md-field>
    </div>
  </form>
</template>

<script src="./submissionedit.js"></script>

<style lang="scss" scoped>
.submission {
  padding: 8px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;
  max-width: 520px;

  .submission-header {
    font-size: large;
  }
}

.md-field {
  margin-right: 8px;
}

.team-wrapper {
  background-color: rgba(0,0,0,0.1);
  flex-basis: 20%;
  flex-grow: 1;
  margin: 8px;
}

.huge-add-button {
  height: 200px;
  width: 200px;
  i.md-icon {
    font-size: 200px!important;
  }
}
</style>
