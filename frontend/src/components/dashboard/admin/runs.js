import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { getUserName, teamsToString } from '../../../helpers';
import { getRuns, getDecisions, updateDecision } from '../../../api';

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
  superyes: 2, yes: 1, maybe: 0, no: -1, superno: -3,
};

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
        const filteredRuns = _.filter(this.runs, run => run.validCuts[this.currentRoundName]);
        console.log('Filtered runs:', filteredRuns);
        return filteredRuns;
      },
    },
  },
  methods: {
    async loadRuns() {
      const runs = await getRuns(this.currentEvent._id);
      console.log('Runs:', runs);

      this.runs = _.map(_.filter(runs, run => run.status !== 'deleted'),
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
            userName: getUserName(run.user),
            name: `${run.game} (${run.category} ${run.runType})`,
            players: teamsToString(run.teams),
            platform: run.platform,
            comment: run.comment,
            description: run.description,
            explanation: ownExplanations,
            decision: ownDecisions,
            otherDecisions,
            cutTotals,
            validCuts,
          };
        });
      console.log('Run list:', this.runList);
    },
    updateCurrentRound(tabName) {
      this.currentRoundName = tabName;
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
      if (decision) run.decision[this.currentRoundName] = decision;
      updateDecision({
        run: run._id, decision, explanation: run.explanation[this.currentRoundName], event: this.currentEvent._id, cut: this.currentRoundName,
      });
      console.log('Runs:', this.runList);
    },
    getDecisionButton(run) {
      const decision = run.decision[this.currentRoundName];
      const button = _.find(this.currentRound.buttons, { value: decision ? decision.icon : null });
      if (button) return button;
      return { color: 'white', icon: '?' };
    },
  },
  watch: {
    currentEvent() {
      this.loadRuns();
    },
  },
};
