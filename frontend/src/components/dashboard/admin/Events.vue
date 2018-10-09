<template>
  <div class="layout-column" v-if="events && user">
    <h1>Events</h1>
    <div class="flex-none">
      <md-button class="md-primary md-raised" @click="newEvent()">New Event</md-button>
    </div>
    <div class="event-list">
      <div class="event-item layout-row md-elevation-2" v-for="event in eventList" :key="event._id">
        <div class="flex-100 layout-column">
          <div class="event-header flex-none">{{event.name}}</div>
          <div class="event-body flex-none">{{event.startDate | moment("YYYY/MM/DD")}} - {{event.endDate | moment("YYYY/MM/DD") }}</div>
          <div class="event-header flex-none">{{event.status}}</div>
        </div>
        <div class="flex-none">
          <md-button class="md-icon-button md-dark" @click="selectEvent(event)"><md-icon>edit</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="duplicateEvent(event)"><md-icon>library_add</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="deleteEvent(event)"><md-icon>delete</md-icon></md-button>
        </div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
      <md-dialog-title>Edit event</md-dialog-title>
      <md-dialog-content>
        <form v-if="selectedEvent" class="layout-padding">
          <div class="layout-row layout-wrap">
            <md-field class="large-field">
              <label for="name">Name</label>
              <md-input name="name" id="name" v-model="selectedEvent.name" />
            </md-field>
            <md-field class="small-field flex-none">
              <label for="status">Status</label>
              <md-select v-model="selectedEvent.status" name="status" id="status">
                <md-option value="unpublished">Unpublished</md-option>
                <md-option value="public">Public</md-option>
              </md-select>
            </md-field>
            <md-field class="large-field flex-100">
              <label for="role">Volunteers needed</label>
              <md-select name="role" id="role" v-model="selectedEvent.volunteersNeeded" multiple>
                <md-option v-for="role in roleList" :key="role._id" :value="role._id">{{role.name}}</md-option>
              </md-select>
            </md-field>

            <md-datepicker class="medium-field" v-model="selectedEvent.startDate">
              <label>Start date</label>
            </md-datepicker>
            <md-datepicker class="medium-field" v-model="selectedEvent.endDate">
              <label>End date</label>
            </md-datepicker>

            <md-datepicker class="medium-field" v-model="selectedEvent.submissionsStart">
              <label>Submissions start</label>
            </md-datepicker>
            <md-datepicker class="medium-field" v-model="selectedEvent.submissionsEnd">
              <label>Submissions end</label>
            </md-datepicker>

            <md-datepicker class="medium-field" v-model="selectedEvent.applicationsStart">
              <label>Volunteer applications start</label>
            </md-datepicker>
            <md-datepicker class="medium-field" v-model="selectedEvent.applicationsEnd">
              <label>Volunteer applications end</label>
            </md-datepicker>
          </div>
        </form>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="saveEvent()">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import { generateID } from '../../../helpers';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'Events',
  data: () => ({
    selectedEvent: null,
    showDialog: false
  }),
  computed: {
    ...mapState(['user', 'events', 'roles']),
    ...mapGetters(['currentEvent']),
    eventList: {
      get() {
        return _.filter(this.events, x => x.status !== "deleted");
      }
    },
    roleList: {
      get() {
        return _.filter(this.$store.state.roles, role => !role.special);
      },
    },
  },
  created() {
    this.$store.dispatch('getRoles');
  },
  methods: {
    newEvent() {
      const newEvent = {
        _id: generateID(),
        name: "",
        status: "unpublished",
        volunteersNeeded: _.map(this.roleList, role => role._id)
      }
      this.selectedEvent = newEvent;
      this.showDialog = true;
    },
    selectEvent(event) {
      this.selectedEvent = _.merge({}, event);
      this.showDialog = true;
    },
    duplicateEvent(event) {
      this.selectedEvent = _.merge({}, event, {id: generateID()});
      this.showDialog = true;
    },
    deleteEvent(event) {
      event.status = "deleted";
      this.$store.dispatch('saveEvent', event);
    },
    saveEvent() {
      this.$store.dispatch('saveEvent', this.selectedEvent);
      this.showDialog = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.event-item {
  padding: 8px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;
  max-width: 520px;

  .event-header {
    font-size: large;
  }
}
</style>
