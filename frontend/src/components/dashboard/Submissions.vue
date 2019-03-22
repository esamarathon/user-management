<template>
  <div class="layout-column" v-if="submissions">
    <h1>Your submissions for {{currentEvent.name}}</h1>
    <div class="flex-none" v-if="submissionsOpen">
      <md-button class="md-primary md-raised" @click="newSubmission()">Submit run</md-button>
    </div>
    <div class="flex-none layout-row" v-else>
      <div class="submissions-closed flex-none">
        <md-icon>lock</md-icon> Sumissions are currently closed.
      </div>
    </div>
    <div class="submission-list">
      <div class="submission layout-row md-elevation-2" v-for="submission in submissionList" :key="submission._id">
        <div class="flex-100 layout-column">
          <div class="submission-header flex-none">{{submission.game}} {{submission.category}}</div>
          <div class="submission-body flex-none">Status: {{submission.status}}</div>
        </div>
        <div class="flex-none">
          <md-button class="md-icon-button md-dark" @click="selectSubmission(submission)" :disabled="!submissionsOpen"><md-icon>edit</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="duplicateSubmission(submission)" :disabled="!submissionsOpen"><md-icon>library_add</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="deleteSubmission(submission)" :disabled="!submissionsOpen"><md-icon>delete</md-icon></md-button>
        </div>
      </div>
    </div>
    <submission-edit :selectedSubmission="selectedSubmission" @submit="saveSubmission()" @cancel="showDialog=false" :showDialog.sync="showDialog"></submission-edit>
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

.submissions-closed {
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
