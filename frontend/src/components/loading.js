import { decodeToken } from '../auth';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

export default {
  name: 'App',
  created() {
    // here we want to check if the JWT is valid etc. If it is, redirect to /dashboard. Else, redirect to /login
    setTimeout(() => {
      const jwt = getCookie('esa-jwt');
      try {
        const token = decodeToken(jwt);
        this.$router.push({ name: 'Home' });
      } catch (err) {
        console.log(err);
        this.$router.push({ name: 'Login' });
      }
    }, 1500);
  },
};
