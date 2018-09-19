import { getUser } from '../api';


export default {
  name: 'Dashboard',
  data: () => ({
    user: null,
    // this should probably be vuex
    eventID: null,
    events: [{
      id: 5,
      name: 'ESAW18',
    }, {
      id: 6,
      name: 'ESAS18',
    }, {
      id: 7,
      name: 'ESAW19',
    }, {
      id: 8,
      name: 'ESAS19',
    }],
  }),
  async created() {
    this.eventID = this.events[this.events.length - 1].id;

    this.$store.state.user = await getUser();
    console.log(this.user);
  },
  methods: {
    logout() {

    },
  },
};
