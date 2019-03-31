import { mapState, mapGetters } from 'vuex';
import { RecycleScroller } from 'vue-virtual-scroller';
import VueScreenSize from 'vue-screen-size';
import { getRuns } from '../../api';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { teamsToString } from '../../helpers';
import SubmissionDetails from './SubmissionDetails.vue';

export default {
  name: 'PublicSubmissions',
  data: () => ({
    runs: [],
    showDialog: false,
    selectedRun: null,
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
    getRunners(run) {
      return run.runType === 'solo' ? run.user.connections.twitch.displayName : teamsToString(run.teams);
    },
    async updateRuns() {
      if (this.currentEventID) this.runs = await getRuns(this.currentEventID);
    },
    selectRun(run) {
      this.selectedRun = run;
      this.showDialog = true;
    },
  },
  computed: {
    ...mapState(['currentEventID']),
    ...mapGetters(['currentEvent']),
    runList() {
      return this.runs;
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
