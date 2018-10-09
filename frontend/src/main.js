// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueMaterial from 'vue-material';
import Vuex from 'vuex';
import VueMoment from 'vue-moment';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default-dark.css';

import './assets/base.scss';

import App from './App';
import router from './router';
import FlagsDropdown from './components/dashboard/flag-dropdown.vue';
import RadioGroup from './components/dashboard/RadioGroup';
import vuexConfig from './vuex';

import './assets/theme.scss';

Vue.use(VueMaterial);
Vue.use(Vuex);
Vue.use(VueMoment);
Vue.component('flags-dropdown', FlagsDropdown);
Vue.component('radio-group', RadioGroup);

const store = new Vuex.Store(vuexConfig);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
});
