<template>
  <div class="layout-column">
    <h1>Your submissions</h1>
    <div class="flex-none">
      <md-button class="md-primary md-raised">Submit run</md-button>
    </div>
    <div class="submission-list">
      <div class="submission layout-column md-elevation-2" v-for="submission in submissions" :key="submission.id">
        <div class="submission-header flex-none">{{submission.name}}</div>
        <div class="submission-body flex-none">Status: {{submission.status}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Submissions',
  data: () => ({
    submissions: [
      {
        id: '1233',
        name: 'Xrodon any%',
        status: 'accepted',
      },
      {
        id: '1234',
        name: 'Baten Kaitos 100%',
        status: 'declined',
      },
      {
        id: '1235',
        name: 'Final Fantasy XII 100%',
        status: 'pending',
      },
    ],
  }),
};
</script>

<style lang="scss" scoped>
.submission {
  padding: 8px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;
  max-width: 500px;

  .submission-header {
    font-size: large;
  }
}
</style>
