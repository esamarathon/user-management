import _ from 'lodash';
import draggable from 'vuedraggable';
import { mapState, mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';
import {
  required,
  email,
  minLength,
  maxLength,
  helpers,
} from 'vuelidate/lib/validators';
import Team from './Team.vue';
import settings from '../../settings';
import { makeTwitchRequest } from '../../api';
import { generateID } from '../../helpers';

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

function getDisplayName(user) {
  console.log('Returning user name for ', user);
  if (user.display_name.toLowerCase() === user.name) return user.display_name;
  return user.name;
}

const estimate = helpers.regex('estimate', /\d{1,2}:\d{2}/);

const twitchUserCache = {};
export default {
  name: 'SubmissionsEdit',
  data: () => ({
    usernameSearch: [],
    platforms: settings.platforms,
    userToAdd: '',
    twitchUserCache,
  }),
  props: {
    selectedSubmission: Object,
    showDialog: Boolean,
  },
  methods: {
    async initTeams() {
      console.log('Initializing teams');
      if (this.selectedSubmission.runType !== 'solo' && !this.selectedSubmission.teams) {
        this.selectedSubmission.teams = [{
          name: 'Team 1',
          members: [],
        }];
        this.selectedSubmission.invitations = [];
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
        const response = await makeTwitchRequest('https://api.twitch.tv/kraken/users/', { query: { login: this.userToAdd } });
        twitchUser = response[0];
      }
      if (!twitchUser) {
        this.$toasted.error(`Invalid user ${this.userToAdd}`);
        return;
      }
      console.log('Inviting', this.userToAdd, twitchUser);
      try {
        const invite = await this.$store.dispatch('inviteUser', [this.selectedSubmission, `${this.twitchUserCache[this.userToAdd]._id}`]);
        this.$toasted.info('User successfully invited!');
        console.log('Invited user:', invite);
      } catch (err) {
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
    selectUser(item) {
      console.log('Selected', item);
      this.userToAdd = item;
    },
    selectPlatform(item) {
      console.log(item, 'clicked');
      this.selectedSubmission.platform = item;
    },
    getValidationClass(fieldName) {
      const field = this.$v.selectedSubmission[fieldName];

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
        this.$emit('submit', this.selectedSubmission);
      }
    },
  },
  computed: {
    ...mapState(['user']),
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
      },
      category: {
        required,
        minLength: minLength(1),
      },
      estimate: {
        required,
        estimate,
      },
      platform: {
        required,
        minLength: minLength(1),
      },
      video: {
        required,
        minLength: minLength(1),
      },
      description: {
        required,
        minLength: minLength(250),
      },
      comment: {
        required,
        minLength: minLength(250),
      },
    },
  },
};
