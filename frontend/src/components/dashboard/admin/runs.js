import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { getUserName, teamsToString, emptySubmission } from '../../../helpers';
import { getRuns, updateDecision } from '../../../api';
import submissionDetails from '../SubmissionDetails.vue';
import submissionEdit from '../SubmissionEdit.vue';

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
  'Players',
  'Platform',
  'Estimate',
  'Comment',
  'Video',
  'Decision',
];
const activeColumns = [
  'Submitted by',
  'Name',
  'Players',
  'Platform',
  'Estimate',
  'Video',
  'Decision',
];

export default {
  name: 'Admin',
  async created() {
    if (this.currentEvent) await this.loadRuns();
  },
  data: () => ({
    rounds: [{ name: 'First cut', buttons: basicButtons },
      { name: 'Second cut', buttons: basicButtons },
      { name: 'Final selection', buttons: finalButtons }],
    runs: null,
    currentRoundName: 'First cut',
    columns,
    activeColumns: activeColumns.slice(),
    filteredRuns: null,
    showDialog: false,
    showDialog2: false,
    selectedRun: null,
    selectedRun2: null,
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
    runList: {
      get() {
        if (!this.filteredRuns) this.filteredRuns = _.filter(this.runs, run => run.validCuts[this.currentRoundName]);
        return this.filteredRuns;
      },
      set(sortedRuns) {
        this.filteredRuns = sortedRuns;
      },
    },
    showColumns: {
      get() {
        const res = {};
        _.each(columns, (column) => { res[column] = this.activeColumns.includes(column); });
        return res;
      },
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
            players: teamsToString(run.teams),
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
    editRun(run) {
      this.selectedRun2 = _.merge(_.cloneDeep(emptySubmission), _.cloneDeep(run.data));
      console.log('Editing run', run, this.selectedRun2);
      this.showDialog2 = true;
    },
    async saveRun(status) {
      console.log('Saving submission', this.selectedRun);
      try {
        this.selectedRun2.status = status || 'saved';
        await this.$store.dispatch('saveSubmission', this.selectedRun2);
        this.showDialog2 = false;
      } catch (err) {
        console.log(err);
        this.$toasted.error(`Could not save or create submission: ${err.message}`);
        return false;
      }
      return true;
    },
  },
  watch: {
    currentEvent() {
      this.loadRuns();
    },
  },
  components: {
    submissionDetails,
    submissionEdit,
  },
};
