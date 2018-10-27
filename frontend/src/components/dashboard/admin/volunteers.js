import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { getVolunteers } from '../../../api';
import volunteerTable from './VolunteerTable.vue';

export default {
  name: 'Volunteers',
  data: () => ({
    roleMap: null,
    columns: null,
    activeColumns: null,
    volunteers: null,
    volunteersByRole: null,
  }),
  async created() {
    const roles = await this.$store.dispatch('getRoles');
    this.roleMap = new Map();
    _.each(roles, role => this.roleMap.set(role._id, role));
    if (this.currentEvent) this.loadVolunteers();
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['currentEvent']),
    currentRound: {
      get() {
        console.log('Current tab:', this.currentRoundName);
        return _.find(this.rounds, { name: this.currentRoundName });
      },
    },
    runList: {
      get() {
        if (!this.filteredRuns) this.filteredRuns = _.filter(this.runs, run => run.validCuts[this.currentRoundName]);
        return this.filteredRuns;
      },
      set(sortedRuns) {
        this.filteredRuns = sortedRuns;
      },
    },
    showColumns: {
      get() {
        const res = {};
        _.each(this.columns, (column) => { res[column] = this.activeColumns.includes(column); });
        return res;
      },
    },
    eventRoles: {
      get() {
        if (!this.roleMap) return [];
        return this.currentEvent.volunteersNeeded.map(
          roleID => this.roleMap.get(roleID),
        );
      },
    },
  },
  methods: {
    async loadVolunteers() {
      const volunteers = await getVolunteers(this.currentEvent._id);
      const volunteerMap = new Map();
      _.each(volunteers, (volunteer) => {
        const listOfVolunteers = volunteerMap.get(volunteer.role) || [];
        listOfVolunteers.push(volunteer);
        volunteerMap.set(volunteer.role, listOfVolunteers);
      });
      this.volunteersByRole = volunteerMap;
    },
  },
  watch: {
    currentEvent() {
      this.loadVolunteers();
    },
  },
  components: {
    volunteerTable,
  },
};
