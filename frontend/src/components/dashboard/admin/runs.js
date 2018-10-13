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

export default {
  name: 'Admin',
  async created() {
    if (this.currentEvent) await this.loadRuns();
  },
  data: () => ({
    rounds: [{ name: 'First cut', buttons: basicButtons },
      { name: 'Second cut', buttons: basicButtons },
      { name: 'Final selection', buttons: finalButtons }],
    runList: null,
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
  },
  methods: {
    async loadRuns() {
      const [runs, decisions] = await Promise.all([getRuns(this.currentEvent._id), getDecisions(this.currentEvent._id, 'submission')]);
      console.log('Runs:', runs);
      console.log('Decisions:', decisions);

      const decisionMap = new Map();
      _.each(decisions, (decisionObj) => {
        const decisionInfo = decisionMap.get(decisionObj.run)
        || { decision: this.createCutObject(), explanation: this.createCutObject(), otherDecisions: this.createCutObject(Array) };
        if (decisionObj.user._id === this.user._id) {
          decisionInfo.decision[decisionObj.cut] = decisionObj.decision;
          decisionInfo.explanation[decisionObj.cut] = decisionObj.explanation;
        } else {
          decisionInfo.otherDecisions[decisionObj.cut].push(decisionObj);
        }
        decisionMap.set(decisionObj.run, decisionInfo);
      });

      this.runList = _.map(_.filter(runs, run => run.status !== 'deleted'),
        (run) => {
          const decisionInfo = decisionMap.get(run._id);
          return {
            _id: run._id,
            userName: getUserName(run.user),
            name: `${run.game} (${run.category} ${run.runType})`,
            players: teamsToString(run.teams),
            platform: run.platform,
            comment: run.comment,
            description: run.description,
            explanation: decisionInfo ? decisionInfo.explanation : this.createCutObject(),
            decision: decisionInfo ? decisionInfo.decision : this.createCutObject(),
          };
        });
      console.log('Run list:', this.runList);
    },
    updateCurrentRound(tabName) {
      this.currentRoundName = tabName;
    },
    createCutObject(Type) {
      const res = {};
      _.each(this.rounds, (cut) => {
        res[cut.name] = Type ? new Type() : '';
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
