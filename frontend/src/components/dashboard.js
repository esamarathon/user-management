export default {
  name: 'Dashboard',
  data: () => ({
    user: {
      displayName: 'CBenni',
      logo: 'https://static-cdn.jtvnw.net/jtv_user_pictures/cbenni-profile_image-99d37ad0e11bcb85-300x300.jpeg',
    },
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
  created() {
    this.eventID = this.events[this.events.length - 1].id;
  },
  methods: {
    logout() {

    },
  },
};
