<template>
  <div class="layout-column">
    <h1>Submission details for {{submission.name}}</h1>
    {{submission}}
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
