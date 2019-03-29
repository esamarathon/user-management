import PrettyFormat from '../forms/PrettyFormat.vue';

export default {
  name: 'VolunteerTable',
  data: () => ({
    volunteerList: [],
  }),
  props: ['volunteers', 'role'],
  created() {
    if (this.volunteers) this.volunteerList = this.volunteers.slice();
  },
  methods: {
    getAnswer(volunteer, question) {
      console.log('Answer to', question, 'is', volunteer.questions[question._id]);
      return volunteer.questions[question._id];
    },
  },
  components: {
    PrettyFormat,
  },
};
