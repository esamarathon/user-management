import _ from 'lodash';
import { mapState } from 'vuex';
import { getUsers } from '../../../api';
import { generateID, mergeNonArray } from '../../../helpers';

export default {
  name: 'Users',
  data: () => ({
    users: [],
    pages: [],
    searchTerm: '',
    showDialog: false,
    selectedUser: null,
    roleAdd: null,
  }),
  async created() {
    if (!this.roles) await this.$store.dispatch('getRoles');
    this.users = await getUsers();
    _.each(this.users, (user) => {
      _.each(user.roles, (eventRole) => {
        if (!eventRole.event) eventRole.event = 'global';
        eventRole.role = _.find(this.roles, { _id: eventRole.role });
      });
    });
  },
  methods: {
    editUser(user) {
      this.selectedUser = _.cloneDeep(user);
      this.showDialog = true;
    },
    async saveUser() {
      await this.$store.dispatch('saveUser', this.selectedUser);
      mergeNonArray(_.find(this.users, { _id: this.selectedUser._id }), this.selectedUser);
      this.showDialog = false;
      this.selectedUser = null;
    },
    deleteRole(role) {
      this.selectedUser.roles.splice(this.selectedUser.roles.indexOf(role), 1);
    },
    addRole(role) {
      if (!role) return;
      this.selectedUser.roles.push({
        _id: generateID(),
        event: 'global',
        role: _.find(this.roles, { _id: role }),
      });
      console.log(this.selectedUser.roles);
    },
    roleString(user) {
      const result = _.map(_.filter(user.roles, eventRole => eventRole.event === 'global' || eventRole.event === this.currentEventID), eventRole => eventRole.role.name).join(', ');
      return result;
    },
    getAvailability(user) {
      const availability = _.find(user.availability, { event: this.currentEventID });
      return availability ? `${new Date(availability.start).toLocaleDateString()} - ${new Date(availability.end).toLocaleDateString()}` : '';
    },
  },
  computed: {
    ...mapState(['events', 'roles', 'currentEventID']),
  },
};
