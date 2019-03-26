import _ from 'lodash';
import { mapState } from 'vuex';
import { getActivities, getFeed, respondToInvitation } from '../../api';
import { formatTime } from '../../helpers';

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
    feed: [],
  }),
  async created() {
    const result = await getActivities();
    const feed = await getFeed();
    const { activities, invitations } = result;
    this.activities = activities;
    // we exclude denied submissions as well as self-invitations
    this.invitations = _.filter(invitations, invitation => (['saved', 'accepted'].includes(invitation.submission.status) && invitation.user !== invitation.createdBy._id && invitation.submission));
    _.each(this.invitations, (invitation) => {
      invitation.submission.event = _.find(this.events, { _id: invitation.submission.event });
    });
    this.feed = feed;
    _.each(this.feed, (feeditem) => {
      feeditem.event = _.find(this.events, { _id: feeditem.event });
    });
    console.log(result, invitations, this.invitations);
  },
  methods: {
    respondToInvitation(invitation, response) {
      respondToInvitation(invitation, response);
    },
    formatTime(time) {
      return formatTime(time);
    },
  },
  computed: {
    ...mapState(['events']),
  },
};
