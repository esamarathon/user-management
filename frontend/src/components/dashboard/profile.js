import { mapState } from 'vuex';

export default {
  name: 'Profile',
  data: () => ({
    phoneNum: '',
  }),
  methods: {
    flagSelected(selected) {
      this.$store.dispatch('updateUser', { flag: selected.iso });
    },
    twitterUpdated() {
      this.$store.dispatch('updateUser', { connections: { twitter: { handle: this.user.connections.twitter.handle.replace('@', '') } } });
    },
    phoneUpdated() {
      setTimeout(() => {
        this.$store.dispatch('updateUser', { phone: this.phoneNum });
      }, 1);
    },
  },
  computed: {
    ...mapState(['user']),
    twitterHandle: {
      get() {
        if (!this.user.connections || !this.user.connections.twitter) return '';
        return this.user.connections.twitter.handle;
      },
      set(handle) {
        console.log('Setting handle to', handle.replace('@', ''));
        this.$store.commit('updateUser', { connections: { twitter: { handle: handle.replace('@', '') } } });
      },
    },
    phoneNumber: {
      get() {
        return this.phoneNum || this.user.phone_display;
      },
      set(number) {
        console.log('Updating phone number', number);
        this.phoneNum = number;
      },
    },
  },
};
