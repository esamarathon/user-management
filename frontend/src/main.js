// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueMaterial from 'vue-material';
import Vuex from 'vuex';
import VueMoment from 'vue-moment';
import Toasted from 'vue-toasted';
import linkify from 'vue-linkify';

import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default-dark.css';

import './assets/base.scss';

import App from './App';
import router from './router';
import FlagsDropdown from './components/dashboard/flag-dropdown.vue';
import RadioGroup from './components/dashboard/RadioGroup';
import VideoButton from './components/dashboard/admin/VideoButton';
import MdAutocomplete from './components/dashboard/vendor/MdAutocomplete';
import vuexConfig from './vuex';
import settings from './settings';

import './assets/theme.scss';

Vue.use(VueMaterial);
Vue.use(Vuex);
Vue.use(VueMoment);
Vue.component('flags-dropdown', FlagsDropdown);
Vue.component('radio-group', RadioGroup);
Vue.component('video-button', VideoButton);
Vue.component('md-autocomplete', MdAutocomplete);
Vue.use(Toasted, { duration: 3000 });
Vue.directive('linkified', linkify);

const store = new Vuex.Store(vuexConfig);

Vue.config.productionTip = false;

/* eslint-disable no-new */
Vue.mixin({
  store,
  methods: {
    hasAllPermissions(...permissions) {
      const perms = this.$store.getters.permissions;
      if (perms.includes('*')) return true;
      if (!permissions) permissions = settings.permissions;
      for (let i = 0; i < permissions.length; ++i) {
        if (!perms.includes(permissions[i])) return false;
      }
      return true;
    },
    hasAnyPermission(...permissions) {
      const perms = this.$store.getters.permissions;
      if (perms.includes('*')) return true;
      if (permissions.length === 0) permissions = settings.permissions;
      for (let i = 0; i < permissions.length; ++i) {
        if (perms.includes(permissions[i])) return true;
      }
      return false;
    },
  },
});


new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
});
