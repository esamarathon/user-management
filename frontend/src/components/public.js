import _ from 'lodash';
import { mapState } from 'vuex';
import { jwt } from '../auth';
import PublicSubmissions from './dashboard/PublicSubmissions.vue';

export default {
  name: 'Dashboard',
  data: () => ({
  }),
  async created() {
    if (jwt) this.$router.push({ name: 'PublicSubmissions' });

    this.$store.dispatch('getEvents');

    setTimeout(() => { this.collapseNavMobile = true; }, 10);
  },
  computed: {
    ...mapState(['events']),
    currentEventID: {
      get() {
        return this.$store.state.currentEventID;
      },
      set(eventID) {
        this.$store.dispatch('switchEvent', eventID);
      },
    },
    eventList: {
      get() {
        return _.filter(this.events, event => event.status === 'public');
      },
    },
  },
  components: {
    PublicSubmissions,
  },
};
