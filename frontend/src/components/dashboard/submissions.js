import _ from 'lodash';
import { mapState } from 'vuex';

import Team from './Team.vue';
import { generateID } from '../../helpers';
import platforms from './platforms.json';

function findTeamName(teams) {
  if (!teams) return 'Team 1';
  for (let i = teams.length + 1; i < 10; ++i) {
    const name = `Team ${i}`;
    if (!_.find(teams, { name })) return name;
  }
  return null;
}

export default {
  name: 'Submissions',
  data: () => ({
    showDialog: false,
    selectedSubmission: null,
    platforms,
  }),
  methods: {
    newSubmission() {
      const newSubmission = {
        event: this.$store.currentEventID,
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
      };
      this.selectedSubmission = newSubmission;
      this.showDialog = true;
    },
    saveSubmission() {
      this.selectedSubmission.status = 'saved';
      this.$store.dispatch('saveSubmission', this.selectedSubmission);
      this.showDialog = false;
    },
    selectSubmission(submission) {
      this.selectedSubmission = _.merge({}, submission);
      this.showDialog = true;
    },
    duplicateSubmission(submission) {
      this.selectedSubmission = _.merge({}, submission);
      this.selectedSubmission._id = generateID();
      this.showDialog = true;
    },
    deleteSubmission(submission) {
      submission.status = 'deleted';
      this.$store.dispatch('saveSubmission', submission);
    },
    initTeams() {
      console.log('Initializing teams');
      if (this.selectedSubmission.runType !== 'solo' && !this.selectedSubmission.teams) {
        this.selectedSubmission.teams = [{
          name: 'Team 1',
          members: [],
        }];
      }
    },
    addTeam() {
      const name = findTeamName(this.selectedSubmission.teams);
      if (name) {
        this.selectedSubmission.teams.push({
          name,
          members: [],
        });
      }
    },
  },
  computed: {
    ...mapState(['user']),
    submissions: {
      get() {
        return _.filter(this.user.submissions, sub => sub.status !== 'deleted');
      },
    },
  },
  components: {
    team: Team,
  },
};
