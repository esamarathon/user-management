import _ from 'lodash';
import { mergeNonArray } from './helpers';

import {
  updateUser, getEvents, getUser, updateEvent, getRoles, updateRole, getUserApplications, getUserSubmissions, updateSubmission, updateApplication, invite, setUser, discordLogout,
} from './api';
import settings from './settings';

export default {
  state: {
    user: null,
    events: null,
    currentEventID: null,
    roles: null,
    applications: null,
    submissions: null,
    runs: null,
    volunteers: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setRoles(state, roles) {
      state.roles = roles;
    },
    setApplications(state, applications) {
      state.applications = applications;
    },
    setSubmissions(state, submissions) {
      state.submissions = submissions;
    },
    setRuns(state, runs) {
      state.runs = runs;
    },
    updateUser(state, changes) {
      _.merge(state.user, changes);
    },
    discordLogout(state) {
      state.user.connections.discord = null;
    },
    saveSubmission(state, submission) {
      if (!state.submissions) state.submissions = [];
      const existingSubmission = _.find(state.submissions, { _id: submission._id });
      if (existingSubmission) {
        mergeNonArray(existingSubmission, submission);
      } else {
        state.submissions.push(submission);
      }
    },
    saveApplication(state, application) {
      if (!state.applications) state.applications = [];
      const existingApplication = _.find(state.applications, { _id: application._id });
      if (existingApplication) {
        mergeNonArray(existingApplication, application);
      } else {
        state.applications.push(application);
      }
    },
    saveEvent(state, event) {
      if (!state.events) state.events = [];
      const existingEvent = _.find(state.events, { _id: event._id });
      if (existingEvent) {
        mergeNonArray(existingEvent, event);
      } else {
        state.events.push(event);
      }
    },
    saveRole(state, role) {
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
    addInvitation(state, [submission, invitation]) {
      if (!state.submissions) state.submissions = [];
      if (!submission.invitations) submission.invitations = [];
      submission.invitations.push(invitation);
      console.log('Submission is now', submission);
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
    async getApplications({ commit }) {
      const applications = await getUserApplications();
      commit('setApplications', applications);
      return applications;
    },
    async getSubmissions({ commit }) {
      const submissions = await getUserSubmissions();
      commit('setSubmissions', submissions);
      return submissions;
    },
    updateUser({ commit }, changes) {
      if (changes) commit('updateUser', changes);
      return updateUser(changes);
    },
    async discordLogout({ commit }) {
      await discordLogout();
      commit('discordLogout');
    },
    saveUser({ commit }, user) {
      // Admin only API for setting other users
      return setUser(user);
    },
    saveSubmission({ commit }, submission) {
      console.log('Saving submission(2)', JSON.stringify(submission), submission.status);
      commit('saveSubmission', submission);
      return updateSubmission(submission);
    },
    saveApplication({ commit }, application) {
      commit('saveApplication', application);
      return updateApplication(application);
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
    async inviteUser({ commit }, [submission, userID]) {
      console.log('Inviting user ', userID, 'to submission', submission);
      const invitation = await invite(submission, userID);
      console.log('Adding invitation ', invitation, 'to submission', submission);
      commit('addInvitation', [submission, invitation]);
      return invitation;
    },
  },
  getters: {
    currentEvent: state => _.find(state.events, { _id: state.currentEventID }),
    permissions: (state) => {
      if (!state.user) return [];
      const perms = [];
      _.each(state.user.roles, (eventRole) => {
        // global roles get all perms
        if (!eventRole.event) perms.push(...eventRole.role.permissions);
        else if (eventRole.event === state.currentEventID) {
          // event roles only get event perms
          perms.push(..._.filter(eventRole.role.permissions, perm => settings.permissions.includes(perm)));
          // handle * permission by adding all the event permissions
          if (eventRole.role.permissions.includes('*')) perms.push(...settings.permissions);
        }
      });
      console.log('Permissions:', perms);
      return perms;
    },
  },
};
