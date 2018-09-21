<template>
  <div class="layout-column">
    <h1>Your submissions</h1>
    <div class="flex-none">
      <md-button class="md-primary md-raised" @click="newRun()">Submit run</md-button>
    </div>
    <div class="submission-list">
      <div class="submission layout-column md-elevation-2" v-for="submission in submissions" :key="submission.id">
        <div class="submission-header flex-none">{{submission.game}} {{submission.category}}</div>
        <div class="submission-body flex-none">Status: {{submission.status}}</div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog">

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
          </div>
        </form>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="saveRun()">Save</md-button>
        <md-button class="md-accent" @click="showDialog = false">Submit</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'Submissions',
  data: () => ({
    showDialog: false,
    selectedSubmission: null,
    submissions: [
      {
        id: '1233',
        game: 'Xrodon',
        category: 'any%',
        status: 'accepted',
      },
      {
        id: '1234',
        game: 'Baten Kaitos',
        category: '100%',
        status: 'declined',
      },
      {
        id: '1235',
        game: 'Final Fantasy XII',
        category: '100%',
        status: 'pending',
      },
    ],
  }),
  methods: {
    newRun() {
      const newSubmission = {
        id: Math.random().toString(),
        name: '',
        status: 'stub'
      }
      this.selectedSubmission = _.merge({}, newSubmission);
      this.showDialog = true;
    },
    saveRun() {
      const existingSubmission = _.find(this.submissions, {id: this.selectedSubmission.id});
      if(existingSubmission) {
        this.selectedSubmission.status = 'saved';
        _.merge(existingSubmission, this.selectedSubmission)
      } else {
        this.selectedSubmission.status = 'saved';
        this.submissions.push(this.selectedSubmission);
      }
      this.showDialog = false;
    }
  }
};
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
}

.md-field {
  margin-right: 8px;
}
</style>
