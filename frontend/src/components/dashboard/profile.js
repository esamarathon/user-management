import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import settings from '../../settings';
import { generateID, setCookie } from '../../helpers';


export default {
  name: 'Profile',
  data: () => ({
    phoneNum: '',
    discordInvite: settings.discord.invite,
  }),
  methods: {
    flagSelected(selected) {
      this.$store.dispatch('updateUser', { flag: selected.iso });
    },
    twitterUpdated() {
      this.$store.dispatch('updateUser', { connections: { twitter: { handle: this.user.connections.twitter.handle.replace('@', '') } } });
    },
    phoneUpdated() {
      setTimeout(() => {
        this.$store.dispatch('updateUser', { phone: this.phoneNum });
      }, 1);
    },
    discordLogout() {
      this.$store.dispatch('discordLogout');
    },
    discordPublicUpdated() {
      this.$store.dispatch('updateUser', { connections: { discord: { public: this.user.connections.discord.public } } });
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['currentEvent']),
    twitterHandle: {
      get() {
        if (!this.user.connections || !this.user.connections.twitter) return '';
        return this.user.connections.twitter.handle;
      },
      set(handle) {
        console.log('Setting handle to', handle.replace('@', ''));
        this.$store.commit('updateUser', { connections: { twitter: { handle: handle.replace('@', '') } } });
      },
    },
    phoneNumber: {
      get() {
        return this.phoneNum || this.user.phone_display;
      },
      set(number) {
        console.log('Updating phone number', number);
        this.phoneNum = number;
      },
    },
    discordAuthUrl: {
      get() {
        const stateToken = generateID();
        setCookie('discord-csrf', stateToken, 15 * 60 * 1000);
        const redirect = encodeURIComponent(`${settings.api.baseurl}discord`);
        return `https://discordapp.com/api/oauth2/authorize?client_id=${settings.discord.clientID}&redirect_uri=${redirect}&response_type=code&scope=identify&state=${stateToken}`;
      },
    },
    discordAvatar: {
      get() {
        if (!this.user.connections || !this.user.connections.discord) {
          return null;
        }
        const discordConnection = this.user.connections.discord;
        if (discordConnection.avatar.startsWith('a_')) return `https://cdn.discordapp.com/avatars/${discordConnection.id}/${discordConnection.avatar}.gif`;
        return `https://cdn.discordapp.com/avatars/${discordConnection.id}/${discordConnection.avatar}.png`;
      },
    },
    availability: {
      get() {
        return _.find(this.user.availability, availability => availability.event === this.currentEvent._id);
      },
    },
    availabilityStart: {
      get() {
        return this.availability && this.availability.start ? this.availability.start : this.currentEvent.startDate;
      },
      set(number) {
        if (number instanceof Date) {
          number = number.toJSON();
        }
        let updated = false;
        if (this.availability) {
          if (this.availability.start !== number) {
            this.availability.start = number;
            updated = true;
          }
        } else {
          this.user.availability.push({ event: this.currentEvent._id, start: number, end: null });
          updated = true;
        }
        if (updated) this.$store.dispatch('updateUser', { availability: this.user.availability });
      },
    },
    availabilityEnd: {
      get() {
        return this.availability && this.availability.end ? this.availability.end : this.currentEvent.endDate;
      },
      set(number) {
        if (number instanceof Date) {
          number = number.toJSON();
        }
        let updated = false;
        if (this.availability) {
          if (this.availability.end !== number) {
            this.availability.end = number;
            updated = true;
          }
        } else {
          this.user.availability.push({ event: this.currentEvent._id, start: null, end: number });
          updated = true;
        }
        if (updated) this.$store.dispatch('updateUser', { availability: this.user.availability });
      },
    },
  },
};
