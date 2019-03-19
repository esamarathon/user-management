import _ from 'lodash';
import draggable from 'vuedraggable';


export default {
  name: 'Team',
  data: () => ({
    searchTimeout: null,
  }),
  props: ['info'],
  created() {
    // this.ensureEmptyRow();
  },
  methods: {
  },
  components: {
    draggable,
  },
};
