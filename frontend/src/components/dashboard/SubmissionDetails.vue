<template>
  <div class="layout-column">
    <h1>Submission details for {{submission.name}}</h1>
    {{submission}}
    <div class="submission-details layout-column">
      <div class="details-row layout-row">
        <div class="flex-25">Submission ID</div>
        <div class="flex">{{submission.id}}</div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25">Name</div>
        <div class="flex">{{submission.name}}</div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25">Status</div>
        <div class="flex">{{submission.status}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

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
  computed: {
    submission() {
      return _.find(this.submissions, { id: this.$route.params.id });
    },
  },
};
</script>

<style lang="scss">
</style>
