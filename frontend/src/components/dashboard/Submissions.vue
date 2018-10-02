<template>
  <div class="layout-column" v-if="user">
    <h1>Your submissions</h1>
    <div class="flex-none">
      <md-button class="md-primary md-raised" @click="newSubmission()">Submit run</md-button>
    </div>
    <div class="submission-list">
      <div class="submission layout-row md-elevation-2" v-for="submission in submissions" :key="submission.id">
        <div class="flex-100 layout-column">
          <div class="submission-header flex-none">{{submission.game}} {{submission.category}}</div>
          <div class="submission-body flex-none">Status: {{submission.status}}</div>
        </div>
        <div class="flex-none">
          <md-button class="md-icon-button md-dark" @click="selectSubmission(submission)"><md-icon>edit</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="duplicateSubmission(submission)"><md-icon>library_add</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="deleteSubmission(submission)"><md-icon>delete</md-icon></md-button>
        </div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
      <md-dialog-title>Submit run</md-dialog-title>
      <md-dialog-content>
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
            <md-field class="large-field flex-100">
              <md-textarea name="comment" id="comment" v-model="selectedSubmission.description" placeholder="Game description (e.g. explanation of the basic concept, things you would like to be pointed out by the hosts, ...)" />
            </md-field>
            <md-field class="large-field flex-100">
              <md-textarea name="comment" id="comment" v-model="selectedSubmission.comment" placeholder="Comment (e.g. why you are worthy, special requests, ...)" />
            </md-field>
          </div>
        </form>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="saveSubmission()">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script src="./submissions.js">
</script>

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

.small-field {
  min-width: 80px;
  width: auto;
}

.medium-field {
  min-width: 200px;
  width: auto;
  flex-grow: 1;
}

.large-field {
  min-width: 300px;
  width: auto;
  flex-grow: 2;

  &.md-field.md-has-textarea {
    margin: 8px;
    padding: 8px;

    .md-textarea {
      padding: 0;
    }
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
