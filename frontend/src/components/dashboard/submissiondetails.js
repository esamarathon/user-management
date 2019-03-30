import _ from 'lodash';
import { mapState } from 'vuex';
import { getSubmission } from '../../api';
import { teamsToString } from '../../helpers';

export default {
  name: 'SubmissionDetails',
  data: () => ({
    s: null,
    event: { name: '' },
  }),
  props: ['submission'],
  async created() {
    this.s = _.isObject(this.submission) ? this.submission : await getSubmission(this.submission || this.$route.params.id);
    console.log('Got submission', this.s);
    this.event = _.find(this.events, { _id: this.s.event._id || this.s.event }) || { name: '' };
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
};
