import { unsubscribe } from '../api';
import { decodeToken } from '../auth';

export default {
  name: 'Unsubscribe',
  data: () => ({
    status: 'notoken',
    token: null,
  }),
  created() {
    this.token = decodeToken(this.$route.query.jwt);
    if (this.token) this.status = 'ask';
  },
  methods: {
    async unsubscribe() {
      console.log('Unsubscribing');
      await unsubscribe({ jwt: this.$route.query.jwt });
      this.status = 'done';
    },
  },
};
