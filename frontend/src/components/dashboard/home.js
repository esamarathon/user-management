import _ from 'lodash';
import Vue from 'vue';
import { mapState } from 'vuex';
import { getActivities, respondToInvitation } from '../../api';

export default {
  name: 'Home',
  data: () => ({
    activities: [],
    invitations: [],
  }),
  async created() {
    this.updateActivities();
  },
  methods: {
    async respondToInvitation(invitation, response) {
      invitation.class = response;
      await respondToInvitation(invitation, response);
      await this.updateActivities();
    },
    formatTime(time) {
      return new Date(time).toLocaleDateString(undefined, {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
      });
    },
    async updateActivities() {
      const result = await getActivities();
      const { activities, invitations } = result;
      this.activities = activities;
      this.invitations = _.filter(invitations, invitation => (['saved', 'accepted'].includes(invitation.submission.status) && invitation.user !== invitation.createdBy._id && invitation.submission));
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
