import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';

import SubmissionEdit from './SubmissionEdit.vue';
import { generateID } from '../../helpers';
import settings from '../../settings';


export default {
  name: 'Submissions',
  data: () => ({
    showDialog: false,
    selectedSubmission: null,
    userToAdd: '',
  }),
  created() {
    this.$store.dispatch('getSubmissions');
  },
  methods: {
    newSubmission() {
      const newSubmission = {
        event: this.currentEvent._id,
        _id: generateID(),
        game: '',
        category: '',
        platform: '',
        status: 'stub',
        estimate: '',
        comment: '',
        description: '',
        runType: 'solo',
        teams: null,
        invitations: null,
      };
      this.selectedSubmission = newSubmission;
      this.saveSubmission();
      this.showDialog = true;
    },
    saveSubmission() {
      console.log("Saving submission", this.selectedSubmission)
      this.selectedSubmission.status = 'saved';
      this.$store.dispatch('saveSubmission', this.selectedSubmission);
      this.showDialog = false;
    },
    selectSubmission(submission) {
      this.selectedSubmission = _.cloneDeep(submission);
      this.showDialog = true;
      console.log("Editing submission", submission);
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
        return sub.status !== 'deleted' && sub.event === this.currentEvent._id;
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
