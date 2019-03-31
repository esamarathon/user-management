import _ from 'lodash';
import { mapState } from 'vuex';
import { getSubmission } from '../../api';
import { teamsToString, emptySubmission } from '../../helpers';
import SubmissionEdit from './SubmissionEdit.vue';

export default {
  name: 'SubmissionDetails',
  data: () => ({
    s: null,
    event: { name: '' },
    selectedRun: null,
    showDialog: false,
  }),
  props: ['submission'],
  async created() {
    this.s = _.isObject(this.submission) ? this.submission : await getSubmission(this.submission || this.$route.params.id);
    console.log('Got submission', this.s);
    this.event = _.find(this.events, { _id: this.s.event._id || this.s.event }) || { name: '' };
  },
  methods: {
    editRun() {
      this.selectedRun = _.merge(_.cloneDeep(emptySubmission), _.cloneDeep(this.s));
      console.log('Editing run', this.s, this.selectedRun);
      this.showDialog = true;
    },
    async saveRun(status) {
      console.log('Saving submission', this.selectedRun);
      try {
        this.selectedRun.status = status || 'saved';
        await this.$store.dispatch('saveSubmission', this.selectedRun);
        this.showDialog = false;
      } catch (err) {
        console.log(err);
        this.$toasted.error(`Could not save or create submission: ${err.message}`);
        return false;
      }
      return true;
    },
  },
  computed: {
    ...mapState(['events']),
    name() {
      if (!this.s) return '';
      if (this.s.runType === 'solo') return `${this.s.game} (${this.s.category})`;
      return `${this.s.game} (${this.s.category} ${this.s.runType})`;
    },
    teamString() {
      return teamsToString(this.s.teams); // _.map(this.s.teams, team => _.map(team.members, member => member.user.connections.twitch.displayName).join(', ')).join(' vs ');
    },
    incentives() {
      return _.filter(this.s.incentives, i => i.type === 'incentive');
    },
    bidwars() {
      console.log(this.s.incentives);
      return _.filter(this.s.incentives, i => i.type === 'bidwar');
    },
  },
  components: {
    SubmissionEdit,
  },
};
