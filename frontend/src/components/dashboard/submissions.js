import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';

import SubmissionEdit from './SubmissionEdit.vue';
import { generateID, emptySubmission } from '../../helpers';
import settings from '../../settings';

export default {
  name: 'Submissions',
  data: () => ({
    showDialog: false,
    selectedSubmission: null,
    userToAdd: '',
    discordInvite: settings.discord.invite,
  }),
  created() {
    this.$store.dispatch('getSubmissions');
  },
  methods: {
    async newSubmission() {
      const newSubmission = _.merge(_.cloneDeep(emptySubmission), {
        event: this.currentEvent._id,
        _id: generateID(),
      });
      this.selectedSubmission = newSubmission;
      if (await this.saveSubmission('stub')) this.showDialog = true;
      else this.selectedSubmission = null;
    },
    async saveSubmission() {
      console.log('Saving submission', this.selectedSubmission);
      try {
        await this.$store.dispatch('saveSubmission', this.selectedSubmission);
        this.showDialog = false;
      } catch (err) {
        console.log(err);
        this.$toasted.error(`Could not save or create submission: ${err.message}`);
        return false;
      }
      return true;
    },
    selectSubmission(submission) {
      this.selectedSubmission = _.merge(_.cloneDeep(emptySubmission), _.cloneDeep(submission));
      this.showDialog = true;
      console.log('Editing submission', submission);
    },
    async duplicateSubmission(submission) {
      this.selectedSubmission = _.cloneDeep(submission);
      this.selectedSubmission._id = generateID();
      this.selectedSubmission.teams = null;
      this.selectedSubmission.invitations = null;
      this.selectedSubmission.runType = 'solo';
      this.selectedSubmission.status = 'stub';
      await this.saveSubmission('stub');
      this.showDialog = true;
    },
    deleteSubmission(submission) {
      submission.status = 'deleted';
      this.$store.dispatch('saveSubmission', submission);
    },
  },
  computed: {
    ...mapState(['user', 'submissions']),
    ...mapGetters(['currentEvent']),
    submissionList() {
      return _.filter(this.submissions, (sub) => {
        console.log('Events', sub.event, this.currentEvent._id, 'are');
        return ['saved', 'accepted', 'rejected'].includes(sub.status) && sub.event === this.currentEvent._id;
      });
    },
    submissionsOpen() {
      const today = new Date();
      return new Date(this.currentEvent.submissionsStart) < today && new Date(this.currentEvent.submissionsEnd) > today;
    },
  },
  components: {
    submissionEdit: SubmissionEdit,
  },
};
