import _ from 'lodash';
import draggable from 'vuedraggable';
import { mapState, mapGetters } from 'vuex';
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
      console.log(this.userToAdd);
      const invite = await this.$store.dispatch('inviteUser', [this.selectedSubmission, `${this.twitchUserCache[this.userToAdd]._id}`]);
      console.log('Invited user:', invite);
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
  },
  computed: {
    ...mapState(['user']),
  },
  components: {
    team: Team,
    draggable,
  },
};
