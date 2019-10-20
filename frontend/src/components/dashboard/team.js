import _ from 'lodash';
import draggable from 'vuedraggable';


export default {
  name: 'Team',
  data: () => ({
    searchTimeout: null,
  }),
  props: ['info', 'disabled'],
  created() {
    // this.ensureEmptyRow();
  },
  methods: {
    deleteTeam() {
      this.emit('delete', this.info);
    },
  },
  components: {
    draggable,
  },
};
