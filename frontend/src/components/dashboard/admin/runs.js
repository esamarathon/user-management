import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import VueScreenSize from 'vue-screen-size';
import { RecycleScroller } from 'vue-virtual-scroller';
import Papa from 'papaparse';
import { getUserName, emptySubmission } from '../../../helpers';
import { getRuns, updateDecision, getSubmission } from '../../../api';
import SubmissionDetails from '../SubmissionDetails.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const basicButtons = [
  {
    title: 'Superyes',
    icon: 'favorite',
    value: 'superyes',
    color: '#33ff00',
  },
  {
    title: 'Yes',
    icon: 'done',
    value: 'yes',
    color: '#55cc33',
  },
  {
    title: 'Maybe',
    icon: 'remove_circle_outline',
    value: 'maybe',
    color: '#ffcc33',
  },
  {
    title: 'No',
    icon: 'close',
    value: 'no',
    color: '#ff5533',
  },
  {
    title: 'Superno',
    icon: 'delete',
    value: 'superno',
    color: '#aa0000',
  },
];
const finalButtons = [
  {
    title: 'Accept',
    icon: 'done',
    value: 'accepted',
    color: '#33ff00',
  },
  {
    title: 'Backup',
    icon: 'queue',
    value: 'accepted (backup)',
    color: '#cc33cc',
  },
  {
    title: 'Bonus run',
    icon: 'attach_money',
    value: 'accepted (bonus)',
    color: '#33ccff',
  },
  {
    title: 'Decline',
    icon: 'delete',
    value: 'declined',
    color: '#aa0000',
  },
];

const decisionValues = {
  superyes: 2, yes: 1, maybe: 0, no: -1, superno: -2,
};

const columns = [
  'Submitted by',
  'Name',
  'Runners',
  'Platform',
  'Estimate',
  'Comment',
  'Video',
  'Decision',
];
const activeColumns = [
  'Submitted by',
  'Name',
  'Runners',
  'Platform',
  'Estimate',
  'Video',
  'Decision',
];

function search(items, string) {
  const needle = string.toLowerCase();
  return _.filter(items, item => item.name.toLowerCase().includes(needle)
    || item.data.platform.toLowerCase().includes(needle)
    || item.data.runType.toLowerCase().includes(needle)
    || item.data.runners.toLowerCase().includes(needle));
}

function formatJSONExport(runs, event) {
  return _.map(runs, run => ({
    _id: run.data._id,
    date: run.data.createdAt,
    game: run.data.game,
    leaderboards: run.data.leaderboards,
    runner: run.userName,
    runnerSpeedrunDotCom: run.data.user.connections.srdotcom.name,
    runnerTwitch: run.data.user.connections.twitch.name,
    category: run.data.category,
    runType: run.data.runType,
    platform: run.data.platform,
    estimate: run.data.estimate,
    video: run.data.video,
    comment: run.data.comment,
    participants: run.data.runners,
    availabilityFrom: run.data.user.availability.length > 0 ? run.data.user.availability[0].start : event.startDate,
    availabilityUntil: run.data.user.availability.length > 0 ? run.data.user.availability[0].end : event.endDate,
  }));
}

function dateStrToCSVTime(date) {
  return `=DATEVALUE("${date.substring(0, 10)}") + TIMEVALUE("${date.substring(11, 19)}")`;
}

function convertCSV(data) {
  const rows = _.map(data, run => ({
    _id: run._id,
    Runner: `=HYPERLINK("https://www.speedrun.com/user/${run.runnerSpeedrunDotCom}", "${run.runner} (${run.runnerTwitch})")`,
    Game: `=HYPERLINK("${run.leaderboards}", "${run.game.replace('"', '""')}")`, // sanitize game name so formula remains valid
    Category: run.category,
    'Run Type': run.runType,
    Participants: (run.runType && run.runType.toLowerCase() !== 'solo') ? run.participants : null,
    Estimate: run.estimate,
    Platform: run.platform,
    Video: `=HYPERLINK("${run.video}")`,
    Comment: run.comment,
    'Available From': run.availabilityFrom ? dateStrToCSVTime(run.availabilityFrom) : null,
    'Available Until': run.availabilityUntil ? dateStrToCSVTime(run.availabilityUntil) : null,
  }));
  return Papa.unparse(rows);
}

export default {
  name: 'Admin',
  async created() {
    if (this.currentEvent) await this.loadRuns();
  },
  data: () => ({
    rounds: [{ name: 'First cut', buttons: basicButtons },
      { name: 'Second cut', buttons: basicButtons },
      { name: 'Final selection', buttons: finalButtons }],
    runs: [],
    currentRoundName: 'First cut',
    columns,
    activeColumns: activeColumns.slice(),
    showDialog: false,
    selectedRun: null,
    searchTerm: '',
    orders: [['createdAt', 'asc']],
  }),
  computed: {
    ...mapState(['user']),
    ...mapGetters(['currentEvent']),
    currentRound: {
      get() {
        console.log('Current tab:', this.currentRoundName);
        return _.find(this.rounds, { name: this.currentRoundName });
      },
    },
    runList() {
      const filteredRuns = _.filter(this.runs, run => run.validCuts[this.currentRoundName]);
      if (this.searchTerm) return _.orderBy(search(filteredRuns, this.searchTerm), ..._.zip(...this.orders));
      return _.orderBy(filteredRuns, ..._.zip(...this.orders));
    },
    orderDirections() {
      return _.fromPairs(this.orders);
    },
    itemSize() {
      return this.$vssWidth < 1600 ? 300 : 75;
    },
    showColumns: {
      get() {
        const res = {};
        _.each(columns, (column) => { res[column] = this.activeColumns.includes(column); });
        return res;
      },
    },
    exportJSON() {
      return formatJSONExport(this.runs, this.currentEvent);
    },
    downloadURIJSON() {
      return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.exportJSON, null, 2))}`;
    },
    downloadURICSV() {
      return `data:text/csv;charset=utf-8,${encodeURIComponent(convertCSV(this.exportJSON))}`;
    },
  },
  methods: {
    async loadRuns() {
      const runsResponse = await getRuns(this.currentEvent._id);
      console.log('Runs:', runsResponse);

      this.runs = _.map(_.filter(runsResponse, run => run.status !== 'deleted'),
        (run) => {
          const ownDecisions = this.createCutObject();
          const ownExplanations = this.createCutObject();
          const otherDecisions = this.createCutObject(Array);
          const cutTotals = this.createCutObject(Number);
          const validCuts = this.createCutObject(Boolean);
          _.each(run.decisions, (decisionObj) => {
            if (decisionObj.user === this.user._id) {
              ownDecisions[decisionObj.cut] = decisionObj.decision;
              ownExplanations[decisionObj.cut] = decisionObj.explanation;
            } else {
              otherDecisions[decisionObj.cut].push(decisionObj);
            }
            cutTotals[decisionObj.cut] += decisionValues[decisionObj.decision] || 0;
          });
          // only allow the run in cuts it has moved on to
          for (let i = 0; i < this.rounds.length; ++i) {
            const cut = this.rounds[i];
            validCuts[cut.name] = true;
            if (cutTotals[cut.name] <= 0) break;
          }
          return {
            _id: run._id,
            data: run,
            userName: getUserName(run.user),
            name: `${run.game} (${run.category} ${run.runType})`,
            explanation: ownExplanations,
            decision: ownDecisions,
            otherDecisions,
            cutTotals,
            validCuts,
          };
        });
      console.log('Run list:', this.runList);
      this.filteredRuns = null;
    },
    updateCurrentRound(tabName) {
      this.currentRoundName = tabName;
      this.filteredRuns = null;
    },
    createCutObject(Type) {
      // creates an object {'First cut': new Type(), 'Second cut': new Type(), 'Final selection': new Type()}
      // Type defaults to string
      const res = {};
      _.each(this.rounds, (cut) => {
        res[cut.name] = Type ? new Type().valueOf() : '';
      });
      return res;
    },
    decide(run, decision) {
      const decisionObj = {
        run: run._id,
        decision,
        explanation: run.explanation[this.currentRoundName],
        event: this.currentEvent._id,
        cut: this.currentRoundName,
        user: this.user._id,
      };
      this.updateDecision(run, decisionObj);
      updateDecision(decisionObj);
      if (decision) run.decision[this.currentRoundName] = decision;
      console.log('Runs:', this.runList);
    },
    updateDecision(run, decisionObj) {
      if (decisionObj.user === this.user._id) {
        console.log('Decreasing cut value by', decisionValues[run.decision[decisionObj.cut]] || 0, 'from', run.cutTotals[decisionObj.cut]);
        run.cutTotals[decisionObj.cut] -= decisionValues[run.decision[decisionObj.cut]] || 0;
      } else {
        const existingDecision = _.find(run.otherDecisions, { user: decisionObj.user });
        if (existingDecision) {
          console.log('Decreasing cut value by', decisionValues[existingDecision.decision] || 0);
          run.cutTotals[decisionObj.cut] -= decisionValues[existingDecision.decision] || 0;
          existingDecision.decision = decisionObj.decision;
          existingDecision.explanation = decisionObj.explanation;
        } else {
          run.otherDecisions[decisionObj.cut].push(decisionObj);
        }
      }
      run.cutTotals[decisionObj.cut] += decisionValues[decisionObj.decision] || 0;
      console.log('Increasing cut value by', decisionValues[decisionObj.decision] || 0, 'to', run.cutTotals[decisionObj.cut]);
    },
    getDecisionButton(run) {
      const decision = run.decision[this.currentRoundName];
      const button = _.find(this.currentRound.buttons, { value: decision ? decision.icon : null });
      if (button) return button;
      return { color: 'white', icon: '?' };
    },
    getStatusIndicatorColor(run) {
      const total = run.cutTotals[this.currentRoundName];
      if (total > 0) return '#33cc33';
      if (total < 0) return '#cc3333';
      return 'transparent';
    },
    viewRun(run) {
      this.selectedRun = run._id;
      this.showDialog = true;
    },
    async editRun(run) {
      this.selectedRun2 = _.merge(_.cloneDeep(emptySubmission), await getSubmission(run._id));
      console.log('Editing run', run, this.selectedRun2);
      this.showDialog2 = true;
    },
    async saveRun() {
      console.log('Saving submission', this.selectedRun);
      try {
        await this.$store.dispatch('saveSubmission', this.selectedRun2);
        this.showDialog2 = false;
      } catch (err) {
        console.log(err);
        this.$toasted.error(`Could not save or create submission: ${err.message}`);
        return false;
      }
      return true;
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
  watch: {
    currentEvent() {
      this.loadRuns();
    },
  },
  components: {
    RecycleScroller,
    SubmissionDetails,
  },
  mixins: [VueScreenSize.VueScreenSizeMixin],
};
