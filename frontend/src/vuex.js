import _ from 'lodash';

import { updateUser, getEvents, updateUserFlat } from './api';

export default {
  state: {
    user: null,
    events: null,
    currentEventID: null,
  },
  mutations: {
    updateUser(state, changes) {
      _.merge(this.state.user, changes);
    },
    async saveSubmission(state, submission) {
      if (!this.state.user.submissions) this.state.user.submissions = [];
      const existingSubmission = _.find(this.state.user.submissions, { _id: submission._id });
      if (existingSubmission) {
        _.merge(existingSubmission, submission);
      } else {
        this.state.user.submissions.push(submission);
      }
    },
    async saveApplication(state, application) {
      if (!this.state.user.applications) this.state.user.applications = [];
      const existingApplication = _.find(this.state.user.applications, { _id: application._id });
      application.status = 'saved'; // eslint-disable-line no-param-reassign
      if (existingApplication) {
        _.merge(existingApplication, application);
      } else {
        state.user.applications.push(application);
      }
    },
    setEvents(state, events) {
      state.events = events;
      state.currentEventID = events[events.length - 1].identifier;
    },
  },
  actions: {
    updateUser({ commit }, changes) {
      if (changes) commit('updateUser', changes);
      return updateUser(changes);
    },
    saveSubmission({ commit }, submission) {
      commit('saveSubmission', submission);
      return updateUserFlat({ submission });
    },
    saveApplication({ commit }, application) {
      commit('saveApplication', application);
      return updateUserFlat({ application });
    },
    async getEvents({ commit }) {
      const events = await getEvents();
      commit('getEvents', events);
    },
  },
  getters: {
    currentEvent: state => _.find(state.events, { identifier: state.currentEventID }),
  },
};
