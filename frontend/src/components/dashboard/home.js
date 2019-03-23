import _ from 'lodash';
import { mapState } from 'vuex';
import { getActivities, respondToInvitation } from '../../api';

export default {
  name: 'Home',
  data: () => ({
    activities: [/*
      {
        id: '23gtozigw37t',
        category: 'run',
        type: 'decline',
        text: 'Your run Baten Kaitos 100% was declined.',
        link: { name: 'SubmissionDetails', params: { id: '1234' } },
      },
      {
        id: '927g3to78ot',
        category: 'run',
        type: 'accept',
        text: 'Your run Xrodon Any% was declined.',
        link: { name: 'SubmissionDetails', params: { id: '1233' } },
      },
      {
        id: '23t8zg783r',
        category: 'volunteering',
        type: 'accept',
        text: 'Your volunteer application for memer was accepted.',
        link: { name: 'ApplicationDetails', params: { id: '420' } },
      },
    */],
    invitations: [],
  }),
  async created() {
    const result = await getActivities();
    const { activities, invitations } = result;
    this.activities = activities;
    // we exclude denied submissions as well as self-invitations
    this.invitations = _.filter(invitations, invitation => (['saved', 'accepted'].includes(invitation.submission.status) && invitation.user !== invitation.createdBy._id && invitation.submission));
    _.each(this.invitations, (invitation) => {
      invitation.submission.event = _.find(this.events, { _id: invitation.submission.event });
    });
    console.log(result, invitations, this.invitations);
  },
  methods: {
    respondToInvitation(invitation, response) {
      respondToInvitation(invitation, response);
    },
    formatTime(time) {
      return new Date(time).toLocaleDateString(undefined, {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
      });
    },
  },
  computed: {
    ...mapState(['events']),
  },
};
