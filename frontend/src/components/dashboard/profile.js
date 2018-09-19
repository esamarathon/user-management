import { mapState } from 'vuex';

export default {
  name: 'Profile',
  data: () => ({}),
  methods: {
    flagSelected(selected) {
      this.$store.commit('updateFlag', selected.iso);
    },
  },
  computed: mapState(['user']),
};
