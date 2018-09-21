import { mapState } from 'vuex';

export default {
  name: 'Profile',
  data: () => ({}),
  methods: {
    flagSelected(selected) {
      this.$store.commit('updateUser', { flag: selected.iso });
    },
  },
  computed: mapState(['user']),
};
