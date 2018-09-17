// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default-dark.css';
import './assets/base.scss';

import App from './App';
import router from './router';
import ProfileConnection from './components/dashboard/ProfileConnection';
import FlagsDropdown from './components/dashboard/flag-dropdown';

import './assets/theme.scss';

Vue.use(VueMaterial);
Vue.component('ProfileConnection', ProfileConnection);
Vue.component('flags-dropdown', FlagsDropdown);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
