import _ from 'lodash';

import { updateUser } from './api';

export default {
  state: {
    user: null,
    events: null,
  },
  mutations: {
    async updateUser(state, changes) {
      _.merge(this.state.user, changes);
      this.state.user = await updateUser(changes);
    },
  },
};
