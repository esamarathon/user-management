import _ from 'lodash';
import { mapState } from 'vuex';
import { jwt } from '../auth';

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export default {
  name: 'Dashboard',
  data: () => ({
    // this should probably be vuex
    eventID: null,
    collapseNav: false,
    collapseNavMobile: false,
  }),
  async created() {
    if (!jwt) this.$router.push({ name: 'Login' });

    this.$store.dispatch('getEvents');
    this.$store.dispatch('getUser');

    setTimeout(() => { this.collapseNavMobile = true; }, 10);
  },
  methods: {
    async logout() {
      deleteCookie('esa-jwt');
      this.$router.push({ name: 'Login' });
    },
  },
  computed: {
    ...mapState(['user', 'events']),
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
  watch: {
    $route(to, from) {
      this.collapseNavMobile = true;
    },
  },
};
