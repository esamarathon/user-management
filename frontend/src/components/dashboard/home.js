import _ from 'lodash';
import Vue from 'vue';
import { mapState } from 'vuex';
import { getActivities, getFeed, respondToInvitation } from '../../api';
import { formatTime } from '../../helpers';

export default {
  name: 'Home',
  data: () => ({
    activities: [],
    invitations: [],
    feed: [],
  }),
  async created() {
    this.updateActivities();
    const feed = await getFeed();
    this.feed = feed;
    _.each(this.feed, (feeditem) => {
      feeditem.event = _.find(this.events, { _id: feeditem.event });
    });
  },
  methods: {
    async respondToInvitation(invitation, response) {
      invitation.class = response;
      await respondToInvitation(invitation, response);
      await this.updateActivities();
    },
    formatTime(time) {
      return formatTime(time);
    },
    async updateActivities() {
      const result = await getActivities();
      const { activities, invitations } = result;
      this.activities = activities;
      this.invitations = _.filter(invitations, invitation => (invitation.submission && ['saved', 'accepted'].includes(invitation.submission.status) && invitation.user !== invitation.createdBy._id));
      _.each(this.invitations, (invitation) => {
        Vue.set(invitation, 'class', invitation.status);
        invitation.submission.event = _.find(this.events, { _id: invitation.submission.event });
      });
    },
  },
  computed: {
    ...mapState(['events']),
    invitationList() {
      return _.filter(this.invitations, invitation => invitation.status === 'pending');
    },
  },
};
