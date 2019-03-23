import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';

import SubmissionEdit from './SubmissionEdit.vue';
import { generateID } from '../../helpers';
import settings from '../../settings';

const emptySubmission = {
  game: '',
  twitchGame: '',
  leaderboards: '',
  category: '',
  platform: '',
  status: 'stub',
  estimate: '',
  comment: '',
  description: '',
  runType: 'solo',
  teams: null,
  invitations: null,
  incentives: [],
};

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
    newSubmission() {
      const newSubmission = _.merge(_.cloneDeep(emptySubmission), {
        event: this.currentEvent._id,
        _id: generateID(),
      });
      this.selectedSubmission = newSubmission;
      this.saveSubmission('stub');
      this.showDialog = true;
    },
    saveSubmission(status) {
      console.log('Saving submission', this.selectedSubmission);
      this.selectedSubmission.status = status || 'saved';
      try {
        this.$store.dispatch('saveSubmission', this.selectedSubmission);
        this.showDialog = false;
      } catch (err) {
        this.$toasted.error(`Could not save submission: ${err.message}`);
      }
    },
    selectSubmission(submission) {
      this.selectedSubmission = _.merge(_.cloneDeep(emptySubmission), _.cloneDeep(submission));
      this.showDialog = true;
      console.log('Editing submission', submission);
    },
    duplicateSubmission(submission) {
      this.selectedSubmission = _.cloneDeep(submission);
      this.selectedSubmission._id = generateID();
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
        return sub.status === 'saved' && sub.event === this.currentEvent._id;
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
