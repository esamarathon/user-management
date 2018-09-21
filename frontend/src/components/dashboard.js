import { mapState } from 'vuex';
import { getUser, getEvents } from '../api';
import { jwt } from '../auth';

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

export default {
  name: 'Dashboard',
  data: () => ({
    // this should probably be vuex
    eventID: null,
    events: [],
  }),
  async created() {
    if (!jwt) this.$router.push({ name: 'Login' });

    getEvents().then((events) => {
      this.$store.state.events = events;
      this.eventID = events[events.length - 1].identifier;
    });

    getUser().then((user) => {
      this.$store.state.user = user;
      console.log(user);
    });
  },
  methods: {
    async logout() {
      deleteCookie('esa-jwt');
      this.$router.push({ name: 'Login' });
    },
  },
  computed: mapState(['user']),
};
