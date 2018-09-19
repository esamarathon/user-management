import { jwt } from '../auth';

export default {
  name: 'App',
  created() {
    // here we want to check if the JWT is valid etc. If it is, redirect to /dashboard. Else, redirect to /login
    if (jwt) {
      this.$router.push({ name: 'Home' });
    } else {
      this.$router.push({ name: 'Login' });
    }
  },
};
