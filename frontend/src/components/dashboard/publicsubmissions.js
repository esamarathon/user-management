import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import VueScreenSize from 'vue-screen-size';
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

import { getRuns } from '../../api';
import SubmissionDetails from './SubmissionDetails.vue';

// dumbest search method I could possibly come up with. works fine™ tho.
function search(items, string) {
  const needle = string.toLowerCase();
  return _.filter(items, item => item.name.toLowerCase().includes(needle)
    || item.platform.toLowerCase().includes(needle)
    || item.runType.toLowerCase().includes(needle)
    || item.runners.toLowerCase().includes(needle));
}

export default {
  name: 'PublicSubmissions',
  data: () => ({
    runs: [],
    showDialog: false,
    selectedRun: null,
    searchTerm: '',
    orders: [['createdAt', 'asc']],
    statusIcon: { accepted: 'check', rejected: 'close' },
  }),
  created() {
    this.updateRuns();
  },
  watch: {
    currentEvent(val) {
      this.updateRuns();
    },
  },
  methods: {
    async updateRuns() {
      if (this.currentEventID) {
        this.runs = await getRuns(this.currentEventID);
        _.each(this.runs, (run) => {
          run.name = `${run.game} (${run.category}${run.runType === 'solo' ? '' : ` ${run.runType}`})`;
        });
      }
    },
    selectRun(run) {
      this.selectedRun = run._id;
      this.showDialog = true;
    },
    toggleOrder(name) {
      // toggles the order in which a column is ordered
      const index = _.findIndex(this.orders, { 0: name });
      if (index >= 0) {
        const item = this.orders.splice(index, 1)[0];
        this.orders.unshift(item);
        item[1] = item[1] === 'asc' ? 'desc' : 'asc';
      } else this.orders.unshift([name, 'asc']);
    },
  },
  computed: {
    ...mapState(['currentEventID']),
    ...mapGetters(['currentEvent']),
    runList() {
      if (this.searchTerm) return _.orderBy(search(this.runs, this.searchTerm), ..._.zip(...this.orders));
      return _.orderBy(this.runs, ..._.zip(...this.orders));
    },
    orderDirections() {
      return _.fromPairs(this.orders);
    },
    itemSize() {
      return this.$vssWidth < 1000 ? 140 : 55;
    },
  },
  components: {
    RecycleScroller,
    SubmissionDetails,
  },
  mixins: [VueScreenSize.VueScreenSizeMixin],
};
