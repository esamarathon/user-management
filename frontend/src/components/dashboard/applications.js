import _ from 'lodash';
import { mapState } from 'vuex';

export default {
  name: 'Applications',
  data: () => ({
    showDialog: false,
    selectedApplication: null,
    roles: [
      {
        _id: '1',
        name: 'Moderator',
      },
      {
        _id: '2',
        name: 'Host',
      },
      {
        _id: '3',
        name: 'Donation Reader',
      },
      {
        _id: '4',
        name: 'Tech',
      },
    ],
  }),
  methods: {
    newRun() {
      const newApplication = {
        id: Math.random().toString(),
        role: '',
        comment: '',
      };
      this.selectedApplication = _.merge({}, newApplication);
      this.showDialog = true;
    },
    saveApplication() {
      this.$store.dispatch('saveApplication', this.selectedApplication);
      this.showDialog = false;
    },
  },
  computed: mapState(['user']),
};
