import _ from 'lodash';
import { makeTwitchRequest } from '../../api';

async function searchForName(search) {
  const data = await makeTwitchRequest(`https://api.twitch.tv/kraken/search/channels?query=${encodeURIComponent(search)}`);
  return data.channels;
}

function getDisplayName(user) {
  console.log('Returning user name for ', user);
  if (user.display_name.toLowerCase() === user.name) return user.display_name;
  return user.name;
}

export default {
  name: 'Team',
  data: () => ({
    usernameSearch: [],
    searchTimeout: null,
  }),
  props: ['info'],
  created() {
    this.ensureEmptyRow();
  },
  methods: {
    ensureEmptyRow() {
      // we dont wanna remove the last row when it is empty, so we start with the second to last
      for (let i = this.info.members.length - 2; i >= 0; --i) {
        if (this.info.members[i].name === '') this.info.members.splice(i, 1);
      }
      console.log('Members', this.info);
      if (this.info.members.length === 0 || this.info.members[this.info.members.length - 1].name !== '') {
        this.info.members.push({ name: '', accepted: false });
      }
    },
    update() {
      this.ensureEmptyRow();
      // this.$emit('input', this.info)
    },
    async searchUsernames(searchTerm) {
      if (searchTerm.length >= 2) {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
          this.usernameSearch = _.map(await searchForName(searchTerm), user => getDisplayName(user));
        }, 300);
      } else {
        this.usernameSearch = [];
      }
      this.ensureEmptyRow();
    },
  },
};
