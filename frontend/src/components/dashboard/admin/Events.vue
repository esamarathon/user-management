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
            <md-checkbox name="role" id="role" v-model="selectedEvent.commentatorsNeeded">
              Enable commentators
            </md-checkbox>

            <div class="flex-100 layout-row">
              <md-datepicker class="medium-field" v-model="selectedEvent.startDate">
                <label>Start date</label>
              </md-datepicker>
              <md-datepicker class="medium-field" v-model="selectedEvent.endDate">
                <label>End date</label>
              </md-datepicker>
            </div>

            <div class="flex-100 layout-row">
              <md-datepicker class="medium-field" v-model="selectedEvent.submissionsStart">
                <label>Submissions start</label>
              </md-datepicker>
              <md-datepicker class="medium-field" v-model="selectedEvent.submissionsEnd">
                <label>Submissions end</label>
              </md-datepicker>
            </div>
            <div class="flex-100 layout-row">
              <div class="medium-field flex-50 layout-row layout-start-center">
                <span>Submission properties that can be changed after submissions end:</span>
              </div>
              <md-field class="medium-field flex-50">
                <label>Allowed edits</label>
                <md-select multiple v-model="selectedEvent.alwaysEditable">
                  <md-option v-for="field in selectableFields" :key="field" :value="field">
                    {{field}}
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <div class="flex-100 layout-row">
              <md-datepicker class="medium-field" v-model="selectedEvent.applicationsStart">
                <label>Volunteer applications start</label>
              </md-datepicker>
              <md-datepicker class="medium-field" v-model="selectedEvent.applicationsEnd">
                <label>Volunteer applications end</label>
              </md-datepicker>
            </div>
            <h3>Event meta</h3>
            <div class="flex-100">
              <md-field class="medium-field flex-50">
                <label>Theme</label>
                <md-select v-model="selectedEvent.meta.theme">
                  <md-option value="summer">Summer</md-option>
                  <md-option value="winter">Winter</md-option>
                </md-select>
              </md-field>
            </div>
            <md-field class="large-field">
              <label for="horaro">Horaro url</label>
              <md-input name="horaro" id="horaro" v-model="selectedEvent.meta.horaro" />
            </md-field>
            <md-field class="large-field">
              <label for="twitchChannel">Twitch channel</label>
              <md-input name="twitchChannel" id="twitchChannel" v-model="selectedEvent.meta.twitchChannel" />
            </md-field>
            <div class="flex-100"><h4>Cause</h4></div>
            <md-field class="large-field">
              <label for="causeName">Name</label>
              <md-input name="causeName" id="causeName" v-model="selectedEvent.meta.cause.name" />
            </md-field>
            <md-field class="large-field">
              <label for="causeLink">Link</label>
              <md-input name="causeLink" id="causeLink" v-model="selectedEvent.meta.cause.link" />
            </md-field>
            <md-field class="large-field">
              <label for="causeLogo">Logo</label>
              <md-input name="causeLogo" id="causeLogo" v-model="selectedEvent.meta.cause.logo" />
            </md-field>
            <div class="flex-100"><h4>Venue</h4></div>
            <md-field class="large-field">
              <label for="venueName">Name</label>
              <md-input name="venueName" id="venueName" v-model="selectedEvent.meta.venue.name" />
            </md-field>
            <md-field class="large-field">
              <label for="venueCountry">Country</label>
              <md-input name="venueCountry" id="venueCountry" v-model="selectedEvent.meta.venue.country" />
            </md-field>
            <md-field class="large-field">
              <label for="venueCity">City</label>
              <md-input name="venueCity" id="venueCity" v-model="selectedEvent.meta.venue.city" />
            </md-field>
            <md-field class="large-field">
              <label for="venueAddress">Address</label>
              <md-input name="venueAddress" id="venueAddress" v-model="selectedEvent.meta.venue.address" />
            </md-field>
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

<script src="./events.js"></script>

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

.text-wrap{
}
</style>
