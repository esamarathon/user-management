import _ from 'lodash';
import { getSubmission } from '../../api';
import { mapState } from 'vuex';

export default {
  name: 'Submissions',
  data: () => ({
    submission: null
  }),
  async created() {
    this.submission = await getSubmission(this.$route.params.id);
    this.submission.event = _.find(this.events, { _id: this.submission.event });
    console.log("Got submission", this.submission)
  },
  computed: {
    ...mapState(['events']),
    name() {
      if(this.submission.runType === "solo") return `${this.submission.game} (${this.submission.category})`
      return `${this.submission.game} (${this.submission.category} ${this.submission.runType})`
    }
  },
};