<template>
  <div class="layout-column" v-if="currentEvent">
    <h1>Volunteer applications for {{currentEvent.name}}</h1>

    <md-tabs md-sync-route class="dark-tabs" v-if="volunteersByRole">
      <md-tab v-for="role in eventRoles" :key="role._id" :md-label="role.name" :to="`/dashboard/admin/volunteers/${role.name.toLowerCase()}`">
        <volunteer-table :volunteers="volunteersByRole.get(role._id)"></volunteer-table>
        <!-- <div v-for="v in volunteersByRole.get(role._id)" :key="v._id">{{v}}</div> -->
      </md-tab>
    </md-tabs>
    <!--
    <md-table class="runs transparent-table" v-model="runList" md-sort="id" v-if="runList">
      <md-table-row slot="md-table-row" slot-scope="{ item }" :style="{'border-left-color': getStatusIndicatorColor(item)}">
        <md-table-cell v-if="showColumns['Submitted by']" md-label="Submitted by" md-sort-by="userName">
          {{item.userName}}
        </md-table-cell>
        <md-table-cell v-if="showColumns['Name']" md-label="Name" md-sort-by="name">{{item.name}}</md-table-cell>
        <md-table-cell v-if="showColumns['Platform']" md-label="Platform" md-sort-by="platform">{{item.platform}}</md-table-cell>
        <md-table-cell v-if="showColumns['Estimate']" md-label="Estimate" md-sort-by="estimate">{{item.estimate}}</md-table-cell>
        <md-table-cell v-if="showColumns['Players']" md-label="Players">{{item.players}}</md-table-cell>
        <md-table-cell v-if="showColumns['Description']" md-label="Description">{{item.description}}</md-table-cell>
        <md-table-cell v-if="showColumns['Comment']" md-label="Comment">{{item.comment}}</md-table-cell>
        <md-table-cell v-if="showColumns['Video']" md-label="Video"><video-button :url="item.video"></video-button></md-table-cell>
        <md-table-cell v-if="showColumns['Decision']" md-label="Decision">
          <div class="layout-row">
            <div class="layout-column flex-none">
              <div class="layout-row flex-none">
                <md-button v-for="button in currentRound.buttons" :key="button.value" @click="decide(item, button.value)"
                class="md-icon-button decision-button flex-none" :class="{'active-decision': item.decision[currentRoundName] === button.value}">
                  <md-icon :style="{color: item.decision[currentRoundName] === button.value ? button.color : 'white'}">{{button.icon}}</md-icon>
                  <md-tooltip md-direction="bottom">{{button.title}}</md-tooltip>
                </md-button>
              </div>
              <div class="layout-row flex-none">
                Other decisions here...
              </div>
            </div>
            <md-field class="flex explanation-field compact">
              <md-textarea md-autogrow placeholder="Explanation" v-model="item.explanation[currentRoundName]" @change="decide(item)"></md-textarea>
            </md-field>
          </div>
        </md-table-cell>
      </md-table-row>
    </md-table>
    <div v-for="application in volunteerList" :key="application._id">
      {{application}}
    </div> -->
  </div>
</template>

<script src="./volunteers.js">
</script>

<style lang="scss">
</style>
