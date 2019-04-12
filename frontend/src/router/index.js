import Vue from 'vue';
import Router from 'vue-router';
import Loading from '../components/Loading.vue';
import Login from '../components/Login.vue';
import Unsubscribe from '../components/Unsubscribe.vue';
import Dashboard from '../components/Dashboard.vue';
import DashboardHome from '../components/dashboard/Home.vue';
import DashboardProfile from '../components/dashboard/Profile.vue';
import DashboardSubmissions from '../components/dashboard/Submissions.vue';
import DashboardSubmissionDetails from '../components/dashboard/SubmissionDetails.vue';
import DashboardApplications from '../components/dashboard/Applications.vue';
import DashboardAdmin from '../components/dashboard/Admin.vue';
import AdminRoles from '../components/dashboard/admin/Roles.vue';
import AdminUsers from '../components/dashboard/admin/Users.vue';
import AdminRuns from '../components/dashboard/admin/Runs.vue';
import AdminVolunteers from '../components/dashboard/admin/Volunteers.vue';
import AdminEvents from '../components/dashboard/admin/Events.vue';
import AdminFeed from '../components/dashboard/admin/Feed.vue';
import PublicSubmissions from '../components/dashboard/PublicSubmissions.vue';
import NoLoginSubmissions from '../components/Public.vue';
import ErrorPage from '../components/ErrorPage.vue';
import settings from '../settings';

Vue.use(Router);

Vue.component('router-link', Vue.options.components.RouterLink);
Vue.component('router-view', Vue.options.components.RouterView);

export default new Router({
  mode: settings.vue.mode,
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
      path: '/unsubscribe',
      name: 'Unsubscribe',
      component: Unsubscribe,
    },
    {
      path: '/submissions',
      name: 'NoLoginSubmissions',
      component: NoLoginSubmissions,
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
          path: 'submissions/public',
          name: 'PublicSubmissions',
          component: PublicSubmissions,
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
          children: [
            {
              path: 'roles',
              name: 'Roles',
              component: AdminRoles,
            },
            {
              path: 'runs',
              name: 'Runs',
              component: AdminRuns,
            },
            {
              path: 'events',
              name: 'Events',
              component: AdminEvents,
            },
            {
              path: 'users',
              name: 'Users',
              component: AdminUsers,
            },
            {
              path: 'volunteers',
              name: 'Volunteers',
              alias: 'volunteers/:type',
              component: AdminVolunteers,
            },
            {
              path: 'feed',
              name: 'Feed',
              component: AdminFeed,
            },
          ],
        },
      ],
    },
    {
      path: '*',
      name: 'Error',
      component: ErrorPage,
    },
  ],
});
