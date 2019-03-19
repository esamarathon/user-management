<template>
  <div class="layout-column flex-100">
    <h1>Home</h1>
    <div class="home-dashboard layout-row flex-100">
      <div class="home-column flex-100">
        <h2>Activity</h2>
        <div class="activity layout-row" v-for="activity in activities" :key="activity.id">
          <!--<span class="activity-category" :class="activity.category">{{activity.category}}</span>
          <span class="activity-type" :class="activity.type">{{activity.type}}</span>-->
          <div class="flex-none" v-if="activity.icon">
            <img :src="activity.icon" class="activity-icon">
          </div>
          <div class="flex-100">
            <span class="activity-time">{{formatTime(activity.updatedAt)}}</span>
            <span class="activity-text">{{activity.text}}</span>
            <span class="activity-link" v-if="activity.link"><router-link :to="activity.link">Details</router-link></span>
          </div>
        </div>
      </div>
      <div class="home-column flex-100">
        <h2>Invitations</h2>
        <div class="invitation layout-row" v-for="invitation in invitations" :key="invitation._id">
          <div class="flex-none">
            <img :src="invitation.createdBy.connections.twitch.logo" class="profilepic">
          </div>
          <div class="flex-100">
            <span class="user-name">{{invitation.createdBy.connections.twitch.displayName}}</span> invited you to join the 
            <span class="run-name">{{invitation.submission.game}} ({{invitation.submission.category}} {{invitation.submission.runType}})</span>
            run at <span class="event-name">{{invitation.submission.event.name}}</span> &mdash; <router-link :to="{name: 'SubmissionDetails', params: { id: invitation.submission._id }}">Details</router-link>
          </div>
          <div class="flex-none layout-row layout-wrap accept-buttons">
            <md-button class="md-icon-button" @click="respondToInvitation(invitation, 'accepted')"><md-icon>check</md-icon></md-button><span><!-- seperates the buttons --></span>
            <md-button class="md-icon-button" @click="respondToInvitation(invitation, 'denied')"><md-icon>clear</md-icon></md-button>
          </div>
        </div>
      </div>
      <div class="home-column flex-100">
        <h2>Feed</h2>
      </div>
    </div>
  </div>
</template> 

<script src="./home.js"></script>

<style lang="scss">
.activity {
  padding: 12px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;

  .activity-category, .activity-type {
    padding: 2px 8px;
    border-radius: 5px;
  }

  .activity-type {
    margin-right: 8px;
  }

  .activity-category.run {
    background-color: #006dd3;
  }

  .activity-category.volunteering {
    background-color: rgb(199, 169, 0);
  }

  .activity-type.decline {
    background-color: #D12746;
  }

  .activity-type.accept {
    background-color: #13AD13;
  }

  .activity-time {
    font-size: small;
    opacity: 0.5;
  }

  .activity-icon {
    height: 2.5em;
    margin-right: 8px;
  }
}

.home-column {
  padding: 8px 16px;
  margin: 8px;
  background-color: rgba(0,0,0,0.5);
}

@media(max-width: 1600px) {
  .accept-buttons {
    flex-direction: column;
  }
}
</style>
