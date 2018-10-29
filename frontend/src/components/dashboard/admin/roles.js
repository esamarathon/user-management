import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import settings from '../../../settings';
import { generateID } from '../../../helpers';
import FormEdit from '../forms/FormEdit.vue';

export default {
  name: 'Roles',
  data: () => ({
    selectedRole: null,
    showDialog: false,
    permissions: settings.permissions,
  }),
  created() {
    this.$store.dispatch('getRoles');
  },
  computed: {
    ...mapState(['user', 'roles']),
    ...mapGetters(['currentEvent']),
  },
  methods: {
    newRole() {
      const newRole = {
        _id: generateID(),
        name: '',
        permissions: [],
        special: false,
      };
      this.selectedRole = newRole;
      this.showDialog = true;
    },
    selectRole(role) {
      this.selectedRole = _.merge({
        form: [{
          _id: generateID(),
          title: 'Untitled question',
          type: 'mdInput',
          value: null,
          options: {},
        }],
      }, role);
      this.showDialog = true;
    },
    duplicateRole(role) {
      this.selectedRole = _.merge({}, role, { id: generateID() });
      this.showDialog = true;
    },
    deleteRole(role) {
      this.$store.dispatch('deleteRole', role);
    },
    saveRole() {
      this.$store.dispatch('saveRole', this.selectedRole);
      this.showDialog = false;
    },
    addQuestion(role) {
      role.form.push({
        _id: generateID(),
        title: 'Untitled question',
        type: 'mdInput',
        value: null,
        options: {},
      });
    },
  },
  components: {
    FormEdit,
  },
};
