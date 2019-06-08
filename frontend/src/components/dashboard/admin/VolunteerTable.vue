<template>
  <div>
    <md-table class="volunteer-table transparent-table" v-model="volunteerList" md-sort="name" v-if="volunteerList">
      <md-table-row :key="item._id" slot="md-table-row" slot-scope="{ item }" class="volunteer-application">
        <md-table-cell md-label="" md-sort-by="status" class="compact-table-cell">
          <md-button class="md-icon-button" @click="viewVolunteer(item)"><md-icon>remove_red_eye</md-icon></md-button>
          <md-button class="md-icon-button" @click="decideVolunteer(item, 'accepted')" :class="{accepted: item.status === 'accepted'}"><md-icon>check</md-icon></md-button>
          <md-button class="md-icon-button" @click="decideVolunteer(item, 'rejected')" :class="{rejected: item.status === 'rejected'}"><md-icon>close</md-icon></md-button>
        </md-table-cell>
        <md-table-cell md-label="Name" md-sort-by="name">{{item.name}}</md-table-cell>
        <md-table-cell v-for="question in role.form" :key="question._id" :md-label="question.title" :md-sort-by="'questions.'+question._id">
          <pretty-format :val="getAnswer(item, question)" :type="typeof(getAnswer(item, question))"></pretty-format>
        </md-table-cell>
        <md-table-cell md-label="Comment" md-sort-by="comment">
          {{item.comment}}
        </md-table-cell>
      </md-table-row>
    </md-table>
    <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="true" :md-close-on-esc="true" v-if="selectedVolunteer">
      <md-dialog-title>Volunteer application by {{selectedVolunteer.name}}</md-dialog-title>
      <md-dialog-content>
        <div class="layout-column">
          <div>Discord name: {{selectedVolunteer.user.connections.discord.name}}#{{selectedVolunteer.user.connections.discord.discriminator}}</div>
          <div>Twitch name: {{selectedVolunteer.name}}</div>
          <div>Availability: {{formatDate(selectedVolunteer.eventAvailability.start)}} - {{formatDate(selectedVolunteer.eventAvailability.end)}}</div>
          <div>
            <div v-for="question in role.form" :key="question._id">
              <h3>{{question.title}}</h3>
              <pretty-format :val="getAnswer(selectedVolunteer, question)" :type="typeof(getAnswer(selectedVolunteer, question))"></pretty-format>
            </div>
          </div>
        </div>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button @click="showDialog = false">OK</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script src="./volunteerTable.js">
</script>

<style lang="scss">

</style>
