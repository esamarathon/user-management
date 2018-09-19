import Vue from 'vue';
import Router from 'vue-router';
import Loading from '../components/Loading.vue';
import Login from '../components/Login.vue';
import Dashboard from '../components/Dashboard.vue';
import DashboardHome from '../components/dashboard/Home';
import DashboardProfile from '../components/dashboard/Profile.vue';
import DashboardSubmissions from '../components/dashboard/Submissions';
import DashboardSubmissionDetails from '../components/dashboard/SubmissionDetails';
import DashboardApplications from '../components/dashboard/Applications';
import DashboardAdmin from '../components/dashboard/Admin';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Loading',
      component: Loading,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      children: [
        {
          path: '/',
          name: 'Home',
          component: DashboardHome,
        },
        {
          path: 'profile',
          name: 'Profile',
          component: DashboardProfile,
        },
        {
          path: 'submissions/:id',
          name: 'SubmissionDetails',
          component: DashboardSubmissionDetails,
        },
        {
          path: 'submissions',
          name: 'Submissions',
          component: DashboardSubmissions,
        },
        {
          path: 'applications',
          name: 'Applications',
          component: DashboardApplications,
        },
        {
          path: 'admin',
          name: 'Admin',
          component: DashboardAdmin,
        },
      ],
    },
  ],
});
