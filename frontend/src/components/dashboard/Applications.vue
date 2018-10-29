<template>
  <div class="layout-column" v-if="applications && roles">
    <h1>Your volunteer applications for {{currentEvent.name}}</h1>
    <div class="flex-none" v-if="applicationsOpen">
      <md-button class="md-primary md-raised" @click="newApplication()">Submit application</md-button>
    </div>
    <div class="flex-none layout-row" v-else>
      <div class="applications-closed flex-none">
        <md-icon>lock</md-icon> Applications are currently closed.
      </div>
    </div>
    <div class="application-list">
      <div class="application layout-row md-elevation-2" v-for="application in applicationList" :key="application._id">
        <div class="flex-100 layout-column">
          <div class="application-header flex-none">{{roleName(application.role)}}</div>
          <div class="application-body flex-none">Status: {{application.status}}</div>
        </div>
        <div class="flex-none">
          <md-button class="md-icon-button md-dark" @click="selectApplication(application)" :disabled="!applicationsOpen"><md-icon>edit</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="deleteApplication(application)" :disabled="!applicationsOpen"><md-icon>delete</md-icon></md-button>
        </div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
      <md-dialog-title>Submit application</md-dialog-title>
      <md-dialog-content>
        <form v-if="selectedApplication" class="layout-padding">
          <div class="layout-row layout-wrap">
            <md-field class="large-field flex-none">
              <label for="role">Role</label>
              <md-select name="role" id="role" v-model="selectedApplication.role">
                <md-option v-for="role in roleList" :key="role._id" :value="role._id">{{role.name}}</md-option>
              </md-select>
            </md-field>
            <!-- Mod applications -->
            <div class="mod-questions flex-100 layout-row layout-wrap" v-if="selectedApplicationRole.name === 'Moderator'">
              <h4>How experienced are you with these moderation technologies?</h4>
              <div class="layout-column flex-100 experience-table">
                <div class="experience-table-headers layout-row flex-none">
                  <div class="experience-table-header flex-25 layout-row layout-center-center" v-for="x in ['', 'Very', 'Somewhat', 'A little', 'Not at all']" :key="x">
                    <span>{{x}}</span>
                  </div>
                </div>
                <div class="experience-table-row layout-row flex-none" v-for="type in ['Moobot', 'Ohbot', 'Discord', 'Logviewer']" :key="type">
                  <div class="experience-table-cell flex-25">{{type}}</div>
                  <div class="experience-table-cell flex-25 layout-row layout-center-center" v-for="i in [4,3,2,1]" :key="i" >
                    <md-radio :value="i" v-model="selectedApplication.questions[type]" class="flex-none"></md-radio>
                  </div>
                </div>
              </div>
              <md-field class="medium-field flex-none">
                <label for="timezone">Timezone</label>
                <md-select name="role" id="role" v-model="selectedApplication.questions.timezone">
                  <md-option v-for="tz in timezones" :key="tz" :value="tz">{{tz}}</md-option>
                </md-select>
              </md-field>
              <md-field class="medium-field flex-none">
                <label for="language">Which languages can you speak/read?</label>
                <md-input name="language" id="language" v-model="selectedApplication.questions.languages" />
              </md-field>
              <md-switch v-model="selectedApplication.questions.onsite">Will you be on site during {{currentEvent.name}}</md-switch>
              <div class="flex-100">
                <h4>Prior moderation experience (ESA and others)</h4>
                <md-field class="large-field flex-100">
                  <md-textarea name="comment" id="comment" v-model="selectedApplication.questions.moderationExperience" />
                </md-field>
              </div>
            </div>
            <!-- Host applications -->
            <div class="mod-questions flex-100" v-if="selectedApplicationRole.name === 'Host' || selectedApplicationRole.name === 'Donation reader'">
              <h4>Couching</h4>
              <md-field class="large-field flex-100">
                <md-textarea name="comment" id="comment" v-model="selectedApplication.questions.couch" placeholder="Which runs will you be couching for?" />
              </md-field>
            </div>
            <!-- Tech applications -->
            <div class="mod-questions flex-100" v-if="selectedApplicationRole.name === 'Tech'">
              <h4>Previous experience with stream tech (ESA or any other)</h4>
              <md-field class="large-field flex-100">
                <md-textarea name="comment" id="comment" v-model="selectedApplication.questions.techExperience" />
              </md-field>
              <p>There will be a small amount (1 or 2) of antisocial shifts (00-04 or 04-08) required, and an infodesk/check in shift.
              Those selected will have access to a discount (400SEK) ticket for the week. Please see the info post for full information.</p>
              <md-checkbox v-model="selectedApplication.questions.graveyardConsent">I agree</md-checkbox>
            </div>
            <!-- All applications -->
            <div class="general-questions flex-100">
              <h4>Comment/General remarks</h4>
              <md-field class="large-field flex-100">
                <md-textarea name="comment" id="comment" v-model="selectedApplication.comment" placeholder="General remarks (e.g. questions, special requests, ...)" />
              </md-field>
            </div>
          </div>
        </form>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="saveApplication()">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script src="./applications.js">
</script>


<style lang="scss" scoped>

.application {
  padding: 8px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;
  max-width: 520px;

  .application-header {
    font-size: large;
  }
}

.md-field {
  margin-right: 8px;
}

.switch-inline {
  position: relative;
  top: -5px;
}

.md-switch {
  margin-left: 16px;
}


.applications-closed {
  padding: 8px;
  margin: 8px;
  background-color: rgba(255, 0, 0, 0.4);
  font-size: large;

  .md-icon.md-theme-default.md-icon-font {
    vertical-align: text-bottom;
    color: white;
  }
}
</style>
