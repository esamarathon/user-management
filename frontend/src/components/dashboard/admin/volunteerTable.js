import _ from 'lodash';
import { mapState } from 'vuex';
import PrettyFormat from '../forms/PrettyFormat.vue';
import { updateApplication } from '../../../api';
import { formatDate } from '../../../helpers';

export default {
  name: 'VolunteerTable',
  data: () => ({
    volunteerList: [],
    selectedVolunteer: null,
    showDialog: false,
  }),
  props: ['volunteers', 'role'],
  created() {
    if (this.volunteers) {
      this.volunteerList = _.filter(this.volunteers, volunteer => volunteer.status !== 'deleted');
      console.log('Volunteer list:', this.volunteerList);
    }
  },
  methods: {
    getAnswer(volunteer, question) {
      return volunteer.questions[question._id];
    },
    async decideVolunteer(volunteer, decision) {
      const result = await updateApplication({ _id: volunteer._id, status: decision });
      volunteer.status = result.status;
    },
    viewVolunteer(volunteer) {
      volunteer.eventAvailability = _.find(volunteer.user.availability, { event: this.currentEventID });
      console.log('Viewing volunteer', volunteer);
      this.selectedVolunteer = volunteer;
      this.showDialog = true;
    },
    formatDate,
  },
  computed: {
    ...mapState(['currentEventID']),
  },
  components: {
    PrettyFormat,
  },
};
