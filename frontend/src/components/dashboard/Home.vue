<template>
  <div class="layout-column flex-100">
    <h1>Home</h1>
    <div class="home-dashboard layout-row flex-100">
      <div class="home-column flex-100 activities">
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
            <span class="activity-link" v-if="activity.link"> &mdash; <router-link :to="activity.link">Details</router-link></span>
          </div>
        </div>
      </div>
      <div class="home-column flex-100 invitations" :class="{'empty': invitationList.length === 0}">
        <h2>Invitations</h2>
        <div class="no-discord flex-none" v-if="user && (!user.connections.discord || !user.connections.srdotcom || !user.connections.srdotcom.name) && invitationList.length > 0">
          <md-icon>warning</md-icon> Please link your discord account and speedrun.com user name to the users tool and check your availability to be able to accept invitations. Go to <router-link :to="{name: 'Profile'}">your profile</router-link> to get started!<br>
          This is necessary so we can contact you in any case. Please also make sure to join our <a :href="discordInvite">discord server</a>
        </div>
        <transition-group name="invitation-list" tag="div">
          <div class="invitation layout-row" :class="`invitation-${invitation.class}`" v-for="invitation in invitationList" :key="invitation._id">
            <div class="flex-none">
              <img :src="invitation.createdBy.connections.twitch.logo" class="profilepic">
            </div>
            <div class="flex-100">
              <span class="user-name">{{invitation.createdBy.connections.twitch.displayName}}</span> invited you to join the
              <span class="run-name">{{invitation.submission.game}} ({{invitation.submission.category}} {{invitation.submission.runType}})</span>
              run at <span class="event-name">{{invitation.submission.event.name}}</span> &mdash; <router-link :to="{name: 'SubmissionDetails', params: { id: invitation.submission._id }}">Details</router-link>
            </div>
            <div class="flex-none layout-row layout-wrap accept-buttons" v-if="user && user.connections.discord && user.connections.srdotcom && user.connections.srdotcom.name">
              <md-button class="md-icon-button accept-button" @click="respondToInvitation(invitation, 'accepted')"><md-icon>check</md-icon></md-button><span><!-- seperates the buttons --></span>
              <md-button class="md-icon-button decline-button" @click="respondToInvitation(invitation, 'denied')"><md-icon>clear</md-icon></md-button>
            </div>
          </div>
        </transition-group>
      </div>
      <div class="home-column flex-100 feed">
        <h2>Feed</h2>
        <div class="feeditem layout-row" v-for="feeditem in feed" :key="feeditem.id">
          <div class="flex-none" v-if="feeditem.icon">
            <img :src="feeditem.icon" class="feeditem-icon">
          </div>
          <div class="flex-100 layout-column">
            <div class="flex-100 layout-row layout-between">
              <span class="feeditem-event">{{feeditem.event.name}}</span>
              <span class="feeditem-time">{{formatTime(feeditem.time)}}</span>
            </div>
            <linkified class="feeditem-text" :text="feeditem.text"></linkified>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./home.js"></script>

<style lang="scss" scoped>
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

.feeditem {
  padding: 12px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;

  .feeditem-time {
    font-size: small;
    opacity: 0.5;
  }

  .feeditem-event {
    font-weight: bold;
  }

  .feeditem-icon {
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
@media (max-width: 600px) {
  .home-dashboard {
    flex-direction: column;
    .home-column {
      min-height: 300px;
      max-height: 500px;
      overflow: auto;
    }
    .invitations {
      order: 1;
      &.empty {
        order: 4;
      }
    }
    .activities {
      order: 2;
    }
    .feed {
      order: 3;
    }
  }
}

.invitation-list-enter-active, .invitation-list-leave-active {
  transition: all 1s;
}
.invitation-list-enter, .invitation-list-leave-to {
  opacity: 0;
}

.invitation.invitation-accepted {
  .md-button.accept-button {
    background-color: #65a713;
  }
}
.invitation.invitation-denied {
  .md-button.decline-button {
    background-color: #a71313;
  }
}

.submissions-closed, .no-discord {
  padding: 8px;
  margin: 8px;
  background-color: rgba(255, 0, 0, 0.4);
  font-size: large;

  .md-icon.md-theme-default.md-icon-font {
    vertical-align: text-bottom;
    color: white;
  }
}
</style>
