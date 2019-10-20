import _ from 'lodash';
import draggable from 'vuedraggable';
import { mapState, mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';
import {
  required,
  url,
  minLength,
  maxLength,
  helpers,
} from 'vuelidate/lib/validators';
import Team from './Team.vue';
import settings from '../../settings';
import { makeTwitchRequest } from '../../api';
import { generateID, moreEqThan, lessEqThan } from '../../helpers';

function findTeamName(teams) {
  if (!teams) return 'Team 1';
  for (let i = teams.length + 1; i < 10; ++i) {
    const name = `Team ${i}`;
    if (!_.find(teams, { name })) return name;
  }
  return null;
}

async function searchForName(search) {
  const data = await makeTwitchRequest(`https://api.twitch.tv/kraken/search/channels?query=${encodeURIComponent(search)}`);
  return data.channels;
}
async function searchForGame(search) {
  const data = await makeTwitchRequest(`https://api.twitch.tv/kraken/search/games?query=${encodeURIComponent(search)}`);
  return data.games;
}

function getDisplayName(user) {
  console.log('Returning user name for ', user);
  if (user.display_name.toLowerCase() === user.name) return user.display_name;
  return user.name;
}

const estimate = helpers.regex('estimate', /^[0-1][0-9]:[0-5][0-9]:[0-5][0-9]$/);

const twitchUserCache = {};
const twitchGameCache = {};
export default {
  name: 'SubmissionsEdit',
  data: () => ({
    usernameSearch: [],
    gameSearch: [],
    platforms: settings.platforms,
    userToAdd: '',
    twitchUserCache,
    twitchGameCache,
  }),
  props: {
    selectedSubmission: Object,
    showDialog: Boolean,
  },
  methods: {
    async initTeams() {
      console.log('Initializing teams');
      if (this.selectedSubmission.runType !== 'solo' && (!this.selectedSubmission.teams || this.selectedSubmission.teams.length === 0)) {
        this.selectedSubmission.teams = [{
          name: 'Team 1',
          members: [],
        }];
        this.selectedSubmission.invitations = this.selectedSubmission.invitations || [];
        const selfInvite = await this.$store.dispatch('inviteUser', [this.selectedSubmission, this.user.connections.twitch.id]); // invites yourself
        console.log('Self invite:', selfInvite);
      }
    },
    addTeam() {
      const name = findTeamName(this.selectedSubmission.teams);
      if (name) {
        this.selectedSubmission.teams.push({
          name,
          members: [],
        });
      }
    },
    async inviteUser() {
      // TODO: send invite user request
      /* this.inviteList.push({
        id: generateID(),
        name: this.userToAdd,
        logo: this.userProfiles[this.userToAdd],
        accepted: false,
      });
      this.userToAdd = ''; */
      let twitchUser = this.twitchUserCache[this.userToAdd];
      if (!twitchUser && this.userToAdd) {
        const response = await makeTwitchRequest(`https://api.twitch.tv/kraken/users/?login=${this.userToAdd}`);
        twitchUser = response.users[0];
      }
      if (!twitchUser) {
        this.$toasted.error(`Invalid user ${this.userToAdd}`);
        return;
      }
      console.log('Inviting', this.userToAdd, twitchUser);
      try {
        const invite = await this.$store.dispatch('inviteUser', [this.selectedSubmission, `${twitchUser._id}`]);
        this.$toasted.info('User successfully invited!');
        console.log('Invited user:', invite);
        this.userToAdd = '';
      } catch (err) {
        console.log(err);
        this.$toasted.error(`User could not be invited: ${err.message}`);
      }
    },
    async searchUsernames(searchTerm) {
      if (searchTerm.length >= 2) {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
          this.usernameSearch = _.map(await searchForName(searchTerm), (user) => {
            const displayName = getDisplayName(user);
            this.twitchUserCache[displayName] = user;
            return displayName;
          });
        }, 300);
      } else {
        this.usernameSearch = [];
      }
    },
    async searchGames(searchTerm) {
      if (searchTerm.length >= 1) {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
          this.gameSearch = _.map(await searchForGame(searchTerm), (game) => {
            this.twitchGameCache[game.name] = game;
            return game.name;
          });
        }, 300);
      } else {
        this.gameSearch = [];
      }
    },
    selectUser(item) {
      console.log('Selected', item);
      this.userToAdd = item;
    },
    selectGame(item) {
      console.log('Selected', item);
      this.selectedSubmission.twitchGame = this.twitchGameCache[item].name;
    },
    selectPlatform(item) {
      console.log(item, 'clicked');
      this.selectedSubmission.platform = item;
    },
    getValidationClass(fieldName) {
      const field = _.get(this.$v.selectedSubmission, fieldName);

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty,
        };
      }
      return null;
    },
    saveSubmission() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (this.selectedSubmission.status === 'stub') this.selectedSubmission.status = 'saved';
        this.$emit('submit', this.selectedSubmission.status);
      }
    },
    addIncentive(type) {
      this.selectedSubmission.incentives.push({
        _id: generateID(),
        type,
        name: '',
        description: '',
        bidwarType: 'freeform',
        freeformMin: 5,
        freeformMax: 20,
        options: '',
      });
      setTimeout(() => {
        this.$refs.dialog.$el.scrollTop = this.$refs.dialog.$el.scrollHeight;
      }, 1);
    },
    deleteIncentive(incentive) {
      this.selectedSubmission.incentives.splice(this.selectedSubmission.incentives.indexOf(incentive), 1);
    },
    editable(field) {
      const editable = this.submissionsOpen || this.currentEvent.alwaysEditable.includes(field) || this.hasAnyPermission('Edit Runs', 'Admin');
      console.log(`Field ${field} is ${editable ? 'editable' : 'not editable'}`);
      return editable;
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['currentEvent']),
    submissionsOpen() {
      const today = new Date();
      return new Date(this.currentEvent.submissionsStart) < today && new Date(this.currentEvent.submissionsEnd) > today;
    },
  },
  components: {
    team: Team,
    draggable,
  },
  mixins: [validationMixin],
  validations: {
    selectedSubmission: {
      game: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(50),
      },
      twitchGame: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(150),
      },
      leaderboards: {
        required,
        url,
      },
      category: {
        required,
        minLength: minLength(3),
        maxLength: maxLength(50),
      },
      estimate: {
        required,
        estimate,
      },
      platform: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(25),
      },
      video: {
        required,
        url,
      },
      comment: {
        required,
        minLength: minLength(100),
        maxLength: maxLength(1000),
      },
      teams: {
        $each: {
          members: {
            required,
            minLength: minLength(1),
          },
        },
      },
      incentives: {
        $each: {
          name: {
            required,
            minLength: minLength(5),
          },
          description: {
            required,
            minLength: minLength(20),
            maxLength: maxLength(200),
          },
          freeformMin: {
            range: lessEqThan('freeformMax'),
          },
          freeformMax: {
            range: moreEqThan('freeformMin'),
          },
        },
      },
    },
  },
};
