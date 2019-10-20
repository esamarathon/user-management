import _ from 'lodash';
import draggable from 'vuedraggable';


export default {
  name: 'Team',
  data: () => ({
    searchTimeout: null,
  }),
  props: ['info', 'disabled', 'candelete'],
  created() {
    // this.ensureEmptyRow();
  },
  methods: {
    deleteTeam() {
      console.log('Requesting deletion', this.info);
      this.$emit('delete-team');
    },
  },
  components: {
    draggable,
  },
};
