<template>
  <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
    <md-dialog-title>Submit run</md-dialog-title>
    <md-dialog-content ref="dialog">
      <form v-if="selectedSubmission" class="layout-padding" autocomplete="off">
        <div class="layout-row layout-wrap">
          <md-field class="large-field flex-none" :class="getValidationClass('game')">
            <label for="game">Game</label>
            <md-input name="game" id="game" v-model="selectedSubmission.game" />
            <span class="md-error" v-if="!$v.selectedSubmission.game.required">The game name is required</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.game.minLength">Invalid game name</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.game.maxLength">Game name too long!</span>
          </md-field>
          <md-autocomplete md-input-placeholder="Twitch game" class="large-field flex-50" v-model="selectedSubmission.twitchGame" :md-options="gameSearch" @md-changed="searchGames(selectedSubmission.twitchGame)" :class="getValidationClass('twitchGame')">
            <label>Twitch game name</label>
            <template slot="md-autocomplete-item" slot-scope="{ item }" @click="selectGame(item)"><span><img :src="twitchGameCache[item].box.small" class=""> {{ item }}</span></template>
            <span class="md-error" v-if="!$v.selectedSubmission.twitchGame.required">The twitch game name is required</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.twitchGame.minLength">Invalid twitch game name</span>
          </md-autocomplete>
          <md-field class="large-field flex-50" :class="getValidationClass('leaderboards')">
            <label for="leaderboards">Leaderboards</label>
            <md-input name="leaderboards" id="leaderboards" v-model="selectedSubmission.leaderboards" />
            <span class="md-error" v-if="!$v.selectedSubmission.leaderboards.required">The leaderboards URL is required</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.leaderboards.url">Invalid leaderboards URL</span>
          </md-field>
          <md-field class="small-field flex-25" v-if="hasAnyPermission('Edit Runs', 'Admin')">
            <label for="status">Status</label>
            <md-select v-model="selectedSubmission.status" name="status" id="status" @md-selected="initTeams()">
              <md-option value="stub" disabled>Stub</md-option>
              <md-option value="saved">Saved</md-option>
              <md-option value="deleted">Deleted</md-option>
              <md-option value="accepted" disabled>Accepted</md-option>
              <md-option value="denied" disabled>Denied</md-option>
            </md-select>
          </md-field>
          <div class="spacer flex-10" v-if="hasAnyPermission('Edit Runs', 'Admin')"></div>
          <div class="spacer flex-45" v-else></div>
          <md-field class="small-field flex-none" :class="getValidationClass('category')">
            <label for="category">Category</label>
            <md-input name="category" id="category" v-model="selectedSubmission.category" />
            <span class="md-error" v-if="!$v.selectedSubmission.category.required">The category name is required</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.category.minLength">Invalid category name</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.category.maxLength">Category name too long!</span>
          </md-field>
          <md-field class="small-field flex-none" :class="getValidationClass('estimate')">
            <label for="estimate">Estimate [hh:mm]</label>
            <md-input name="estimate" id="estimate" v-model="selectedSubmission.estimate" />
            <span class="md-error" v-if="!$v.selectedSubmission.estimate.required">The estimate is required</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.estimate.estimate">Please provide the estimate in hh:mm format.</span>
          </md-field>
          <md-autocomplete class="small-field" v-model="selectedSubmission.platform" :md-options="platforms" :class="getValidationClass('platform')">
            <label>Platform</label>
            <template slot="md-autocomplete-item" slot-scope="{ item }">{{ item }}</template>
            <span class="md-error" v-if="!$v.selectedSubmission.platform.required">The platform is required</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.platform.minLength">Invalid platform name</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.platform.maxLength">Platform name too long!</span>
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
          <div class="team-setup flex-100 layout-column" v-if="selectedSubmission.runType !== 'solo'" :class="getValidationClass('runType')">
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
            <draggable v-model="selectedSubmission.invitations" group="members" class="layout-row layout-wrap">
              <div class="member" v-for="invitation in selectedSubmission.invitations" :key="invitation._id" :class="invitation.status">
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
          <md-field class="large-field flex-none" :class="getValidationClass('video')">
            <label for="video">Video url</label>
            <md-input name="video" id="video" v-model="selectedSubmission.video" />
            <span class="md-error" v-if="!$v.selectedSubmission.video.required">A speedrun video is required (preferably twitch or youtube)</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.video.url">Invalid video URL</span>
          </md-field>
          <md-field class="large-field flex-100" :class="getValidationClass('comment')">
            <label for="comment">Comment (short description of the game, special requirements for the console or setup, ...)</label>
            <md-textarea name="comment" id="comment" v-model="selectedSubmission.comment" md-counter="100" />
            <span class="md-error" v-if="!$v.selectedSubmission.comment.required">A comment is required</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.comment.minLength">Please provide at least 100 characters of comment.</span>
            <span class="md-error" v-else-if="!$v.selectedSubmission.comment.maxLength">Please provide at most 1000 characters of comment</span>
          </md-field>
          <div class="incentives flex-100 layout-column">
            <div class="layout-row layout-start-center layout-wrap">
              <md-button @click="addIncentive('incentive')" class="md-primary md-raised flex-none">Add incentive</md-button>
              <md-button @click="addIncentive('bidwar')" class="md-primary md-raised flex-none">Add bidwar</md-button>
              <div class="hint flex"><md-icon>info</md-icon> Please note that incentives or bidwars should not add more than 5 minutes to your run!</div>
            </div>
            <div class="incentive" v-for="(incentive, index) in selectedSubmission.incentives" :key="incentive._id">
              <div class="incentive-header">{{incentive.type}}</div>
              <div class="incentive-body">
                <div class="layout-row layout-between-center">
                  <md-field class="large-field flex-100" :class="getValidationClass(`incentives.$each.${index}.name`)">
                    <label for="incentivename">Name</label>
                    <md-input name="incentivename" v-model="incentive.name" />
                    <span class="md-error" v-if="!$v.selectedSubmission.incentives.$each[index].name.required">An {{incentive.type}} name is required</span>
                    <span class="md-error" v-else-if="!$v.selectedSubmission.incentives.$each[index].name.minLength">Invalid {{incentive.type}} name</span>
                  </md-field>
                  <md-button class="md-icon-button flex-none" @click="deleteIncentive(incentive)"><md-icon>delete</md-icon></md-button>
                </div>
                <md-field class="large-field flex-none" :class="getValidationClass(`incentives.$each.${index}.description`)">
                  <label for="incentivedescription">Description</label>
                  <md-textarea name="incentivedescription" v-model="incentive.description" />
                  <span class="md-error" v-if="!$v.selectedSubmission.incentives.$each[index].description.required">A description is required for this {{incentive.type}}</span>
                  <span class="md-error" v-else-if="!$v.selectedSubmission.incentives.$each[index].description.minLength">The {{incentive.type}} description needs to be at least 20 characters long</span>
                  <span class="md-error" v-else-if="!$v.selectedSubmission.incentives.$each[index].description.maxLength">The {{incentive.type}} description needs to be at most 200 characters long</span>
                </md-field>
                <div v-if="incentive.type === 'bidwar'" class="layout-row layout-wrap">
                  <md-field class="small-field flex-none">
                    <md-select v-model="incentive.bidwarType" name="bidwarType" id="bidwarType">
                      <label for="bidwarType">Bidwar type</label>
                      <md-option value="freeform">Freeform input</md-option>
                      <md-option value="options">Options</md-option>
                    </md-select>
                  </md-field>
                  <div v-if="incentive.bidwarType === 'freeform'" class="layout-row layout-wrap">
                    <md-field class="small-field flex-none" :class="getValidationClass(`incentives.$each.${index}.freeformMin`)">
                      <label for="freeformMin">Minimum length</label>
                      <md-input type="number" name="freeformMin" v-model="incentive.freeformMin" />
                      <span class="md-error" v-if="!$v.selectedSubmission.incentives.$each[index].freeformMin.range">Invalid minimum</span>
                    </md-field>
                    <md-field class="small-field flex-none" :class="getValidationClass(`incentives.$each.${index}.freeformMax`)">
                      <label for="freeformMin">Maximum length</label>
                      <md-input type="number" name="freeformMin" v-model="incentive.freeformMax" />
                      <span class="md-error" v-if="!$v.selectedSubmission.incentives.$each[index].freeformMax.range">Invalid maximum</span>
                    </md-field>
                  </div>
                  <div v-if="incentive.bidwarType === 'options'" class="flex-100">
                    <md-field class="small-field flex-none">
                      <label for="incentiveoptions">Options (one per line)</label>
                      <md-textarea name="incentiveoptions" v-model="incentive.options" />
                    </md-field>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-accent" @click="$emit('cancel')">Cancel</md-button>
      <md-button class="md-primary" @click="saveSubmission()">Save</md-button>
    </md-dialog-actions>
  </md-dialog>
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
    word-break: break-word;
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

.incentive {
  background-color: rgba(0,0,0,0.5);
  margin: 8px;
  .incentive-header {
    text-transform: capitalize;
    background-color: #2f4f86;
    padding: 8px;
  }
  .incentive-body {
    padding: 8px;
  }
}

.hint {
  width: 50%;
  min-width: 200px;
}

</style>
