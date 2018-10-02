<template>
  <div class="layout-column" v-if="user">
    <h1>Your volunteer applications</h1>
    <div class="flex-none">
      <md-button class="md-primary md-raised" @click="newRun()">Submit application</md-button>
    </div>
    <div class="application-list">
      <div class="application layout-column md-elevation-2" v-for="application in user.applications" :key="application.id">
        <div class="application-header flex-none">{{application.game}} {{application.category}}</div>
        <div class="application-body flex-none">Status: {{application.status}}</div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog">

      <md-dialog-title>Submit application</md-dialog-title>
      <md-dialog-content>
        <form v-if="selectedApplication" class="layout-padding">
          <div class="layout-row layout-wrap">
            <md-field class="large-field flex-none">
              <label for="role">Role</label>
              <md-select name="role" id="role" v-model="selectedApplication.role">
                <md-option v-for="role in roles" :key="role._id" :value="role._id">{{role.name}}</md-option>
              </md-select>
            </md-field>
            <md-field class="large-field flex-100">
              <label for="comment">Comment (e.g. prior experience, special requests, ...)</label>
              <md-textarea name="comment" id="comment" v-model="selectedApplication.comment" />
            </md-field>
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
