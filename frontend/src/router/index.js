import Vue from 'vue';
import Router from 'vue-router';
import Loading from '../components/Loading';
import Dashboard from '../components/Dashboard';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Loading',
      component: Loading,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
    },
  ],
});
