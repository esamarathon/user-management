<template>
  <div class="layout-column" v-if="events && user">
    <h1>Events</h1>
    <div class="flex-none">
      <md-button class="md-primary md-raised" @click="newFeedItem()" v-if="currentEvent">New FeedItem</md-button>
    </div>
    <div class="feed-list">
      <div class="event-item layout-row md-elevation-2" v-for="feeditem in feed" :key="feeditem._id">
        <div class="flex-100 layout-column">
          <div class="feeditem-text flex-none">{{formatTime(feeditem.time)}}</div>
          <div class="feeditem-text flex-none">{{formatUser(feeditem.user)}}</div>
          <div class="feeditem-text flex-none" v-linkified:options="{ nl2br: 'true' }">{{formatText(feeditem.text)}}</div>
        </div>
        <div class="flex-none">
          <md-button class="md-icon-button md-dark" @click="selectFeedItem(feeditem)"><md-icon>edit</md-icon></md-button>
          <md-button class="md-icon-button md-dark" @click="deleteFeedItem(feeditem)"><md-icon>delete</md-icon></md-button>
        </div>
      </div>
    </div>
    <md-dialog :md-active.sync="showDialog" class="big-dialog" :md-click-outside-to-close="false" :md-close-on-esc="false">
      <md-dialog-title>Edit FeedItem</md-dialog-title>
      <md-dialog-content>
        <form v-if="selectedFeedItem" class="layout-padding">
          <div class="layout-row layout-wrap">
            <md-field class="large-field">
              <label for="name">Text</label>
              <md-textarea name="text" id="text" v-model="selectedFeedItem.text" placeholder="Put your news text here."/>
            </md-field>
          </div>
        </form>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="saveFeedItem()">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import { generateID, getUserName, formatTime } from '../../../helpers';
import { mapState, mapGetters } from 'vuex';
import { getFeedByEvent, updateFeed, deleteFeed } from '../../../api';

export default {
  name: 'Feed',
  data: () => ({
    selectedFeedItem: null,
    feed: [],
    showDialog: false
  }),
  computed: {
    ...mapState(['user', 'events']),
    ...mapGetters(['currentEvent']),
  },
  async created() {
    this.updateFeed();
  },
  watch: {
    currentEvent: function (val) {
      this.updateFeed()
    },
  },
  methods: {
    newFeedItem() {
      const newFeedItem = {
        _id: generateID(),
        event: this.currentEvent._id,
        text: "",
        time: Date.now()
      }
      this.selectedFeedItem = newFeedItem;
      this.showDialog = true;
    },
    selectFeedItem(feeditem) {
      this.selectedFeedItem = _.merge({}, feeditem);
      this.showDialog = true;
    },
    async deleteFeedItem(feeditem) {
      await deleteFeed({_id: feeditem._id});
      this.updateFeed();
    },
    async saveFeedItem() {
      this.selectedFeedItem.time = Date.now();
      this.showDialog = false;
      await updateFeed(this.selectedFeedItem);
      this.updateFeed();
    },
    async updateFeed() {
      if (this.currentEvent)
      {
        this.feed = await getFeedByEvent(this.currentEvent._id);
      }
    },
    formatUser(user) {
      return getUserName(user);
    },
    formatTime(time) {
      return formatTime(time);
    },
    formatText(text) {
      return text.length > 100 ? text.substr(0, 97) + '...': text;
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
