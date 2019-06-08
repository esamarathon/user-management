import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { generateID } from '../../../helpers';

export default {
  name: 'Events',
  data: () => ({
    selectedEvent: null,
    showDialog: false,
    selectableFields: ['game', 'twitchGame', 'leaderboards', 'category', 'platform', 'estimate', 'runType', 'teams', 'video', 'comment', 'invitations', 'incentives'],
  }),
  computed: {
    ...mapState(['user', 'events', 'roles']),
    ...mapGetters(['currentEvent']),
    eventList: {
      get() {
        return _.filter(this.events, x => x.status !== 'deleted');
      },
    },
    roleList: {
      get() {
        return _.filter(this.$store.state.roles, role => !role.special);
      },
    },
  },
  created() {
    this.$store.dispatch('getRoles');
  },
  methods: {
    newEvent() {
      const newEvent = {
        _id: generateID(),
        name: '',
        status: 'unpublished',
        volunteersNeeded: _.map(this.roleList, role => role._id),
        selectableFields: [],
        meta: {
          theme: '',
          horaro: '',
          twitchChannel: 'esamarathon',
          cause: {
            name: '',
            link: '',
            logo: '',
          },
          venue: {
            name: '',
            country: '',
            city: '',
            address: '',
          },
        },
      };
      this.selectedEvent = newEvent;
      this.showDialog = true;
    },
    selectEvent(event) {
      this.selectedEvent = _.merge({
        meta: {
          theme: '',
          horaro: '',
          twitchChannel: 'esamarathon',
          cause: {
            name: '',
            link: '',
            logo: '',
          },
          venue: {
            name: '',
            country: '',
            city: '',
            address: '',
          },
        },
      }, event);
      this.showDialog = true;
    },
    duplicateEvent(event) {
      this.selectedEvent = _.merge({}, event, { id: generateID() });
      this.showDialog = true;
    },
    deleteEvent(event) {
      event.status = 'deleted';
      this.$store.dispatch('saveEvent', event);
    },
    saveEvent() {
      this.$store.dispatch('saveEvent', this.selectedEvent);
      this.showDialog = false;
    },
  },
};
