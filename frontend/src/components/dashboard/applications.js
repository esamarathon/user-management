import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { generateID } from '../../helpers';

export default {
  name: 'Applications',
  data: () => ({
    showDialog: false,
    selectedApplication: null,
    timezones: ['Western Europe', 'Eastern Europe', 'US East', 'US West', 'East Asia/Oceania', 'Middle East'],
  }),
  async created() {
    await this.$store.dispatch('getRoles');
  },
  methods: {
    newApplication() {
      const newApplication = {
        event: this.currentEvent._id,
        _id: generateID(),
        role: '',
        questions: {},
        comment: '',
        status: 'stub',
      };
      this.selectedApplication = newApplication;
      this.showDialog = true;
    },
    saveApplication() {
      this.selectedApplication.status = 'saved';
      this.$store.dispatch('saveApplication', this.selectedApplication);
      this.showDialog = false;
    },
    selectApplication(application) {
      this.selectedApplication = _.merge({ questions: {} }, application);
      this.showDialog = true;
    },
    deleteApplication(application) {
      application.status = 'deleted';
      this.$store.dispatch('saveApplication', application);
    },
    roleName(roleID) {
      return _.find(this.$store.state.roles, { _id: roleID }).name;
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['currentEvent']),
    applications: {
      get() {
        console.log('Updating applications list', this.user.applications);
        return _.filter(this.user.applications, app => app.status !== 'deleted' && app.event === this.currentEvent._id);
      },
    },
    applicationsOpen() {
      const today = new Date();
      return new Date(this.currentEvent.applicationsStart) < today && new Date(this.currentEvent.applicationsEnd) > today;
    },
    roleList: {
      get() {
        return _.filter(this.$store.state.roles, role => !role.special && this.currentEvent.volunteersNeeded.includes(role._id));
      },
    },
    selectedApplicationRole: {
      get() {
        if (this.selectedApplication) {
          const role = _.find(this.$store.state.roles, { _id: this.selectedApplication.role });
          if (role) return role;
        }
        return { name: '' };
      },
    },
  },
};
