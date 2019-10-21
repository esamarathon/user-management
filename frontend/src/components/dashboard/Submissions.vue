<template>
  <div class="layout-column" v-if="submissions && user">
    <div class="layout-row layout-between-center">
      <h1>Your submissions for {{currentEvent.name}}</h1>
    </div>
    <div>
      You can see all submissions by everyone <router-link :to="{name:'PublicSubmissions'}">here</router-link>
    </div>
    <div class="flex-none layout-row" v-if="submissionsOpen">
      <md-button class="md-primary md-raised" @click="newSubmission()" v-if="user.connections.discord && user.connections.srdotcom && user.connections.srdotcom.name && submissionList.length < 5">Submit run</md-button>
      <div class="no-discord flex-100" v-if="!user.connections.discord || !user.connections.srdotcom || !user.connections.srdotcom.name">
        <md-icon>warning</md-icon> Please link your discord account to the users tool, provide your speedrun.com user name and check your availability to be able to submit runs. Go to <router-link :to="{name: 'Profile'}">your profile</router-link> to get started!<br>
        This is necessary so we can contact you in any case. Please also make sure to join our <a :href="discordInvite">discord server</a>
      </div>
    </div>
    <div class="flex-none layout-row">
      <div class="submissions-closed flex-none" v-if="!submissionsOpen">
        <md-icon>lock</md-icon> Sumissions are currently closed.
      </div>
      <div class="submissions-closed flex-none" v-if="submissionList.length >= 5">
        <md-icon>lock</md-icon> You have reached the maximum number of submissions for this event.
      </div>
    </div>
    <div class="submission-list">
      <div class="submission layout-row md-elevation-2" v-for="submission in submissionList" :key="submission._id">
        <div class="flex-100 layout-column">
          <div class="submission-header flex-none">{{submission.game}} {{submission.category}}</div>
          <div class="submission-body flex-none">Status: {{submission.status}}</div>
        </div>
        <div class="flex-none">
          <md-button class="md-icon-button md-dark" @click="selectSubmission(submission)"><md-icon>edit</md-icon><md-tooltip md-direction="bottom" md-delay=150>Edit</md-tooltip></md-button>
          <md-button class="md-icon-button md-dark" @click="duplicateSubmission(submission)" :disabled="!submissionsOpen || submissionList.length >= 5"><md-icon>library_add</md-icon><md-tooltip md-direction="bottom" md-delay=150>Duplicate</md-tooltip></md-button>
          <md-button class="md-icon-button md-dark" @click="deleteSubmission(submission)"><md-icon>delete</md-icon><md-tooltip md-direction="bottom" md-delay=150>Delete</md-tooltip></md-button>
        </div>
      </div>
    </div>
    <submission-edit :selectedSubmission="selectedSubmission" @submit="saveSubmission" @cancel="cancelSubmission" :showDialog.sync="showDialog"></submission-edit>
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
    word-break: break-word;
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

.submit-button {

}

.submissions-closed, .no-discord {
  max-width: 1000px;
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
