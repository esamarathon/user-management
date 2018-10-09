import _ from 'lodash';
import { mergeNonArray } from './helpers';

import {
  updateUser, getEvents, updateUserFlat, getUser, updateEvent, getRoles, updateRole,
} from './api';

export default {
  state: {
    user: null,
    events: null,
    currentEventID: null,
    roles: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setRoles(state, roles) {
      state.roles = roles;
    },
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
      if (existingApplication) {
        mergeNonArray(existingApplication, application);
      } else {
        state.user.applications.push(application);
      }
    },
    async saveEvent(state, event) {
      if (!state.events) state.events = [];
      const existingEvent = _.find(state.events, { _id: event._id });
      if (existingEvent) {
        mergeNonArray(existingEvent, event);
      } else {
        state.events.push(event);
      }
    },
    async saveRole(state, role) {
      if (!state.roles) state.roles = [];
      const existingRole = _.find(state.roles, { _id: role._id });
      if (existingRole) {
        mergeNonArray(existingRole, role);
      } else {
        state.roles.push(role);
      }
    },
    setEvents(state, events) {
      state.events = events;
      if (!state.currentEventID) {
        const possibleEvents = _.filter(events, event => event.status === 'public');
        state.currentEventID = possibleEvents[possibleEvents.length - 1]._id;
      }
    },
    setEventID(state, eventID) {
      state.currentEventID = eventID;
    },
  },
  actions: {
    async getUser({ commit }) {
      const user = await getUser();
      commit('setUser', user);
      return user;
    },
    async getRoles({ commit }) {
      const roles = await getRoles();
      commit('setRoles', roles);
      return roles;
    },
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
    saveEvent({ commit }, event) {
      commit('saveEvent', event);
      return updateEvent(event);
    },
    saveRole({ commit }, role) {
      commit('saveRole', role);
      return updateRole(role);
    },
    async getEvents({ commit }) {
      const events = await getEvents();
      commit('setEvents', events);
      return events;
    },
    async switchEvent({ commit }, eventID) {
      commit('setEventID', eventID);
    },
  },
  getters: {
    currentEvent: state => _.find(state.events, { _id: state.currentEventID }),
  },
};
