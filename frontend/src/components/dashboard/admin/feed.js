import _ from 'lodash';
import { mapState, mapGetters } from 'vuex';
import { generateID, getUserName, formatTime } from '../../../helpers';
import { getFeedByEvent, updateFeed, deleteFeed } from '../../../api';
import linkify from '../linkified';

export default {
  name: 'Feed',
  data: () => ({
    selectedFeedItem: null,
    feed: [],
    showDialog: false,
  }),
  computed: {
    ...mapState(['user', 'events']),
    ...mapGetters(['currentEvent']),
  },
  async created() {
    this.updateFeed();
  },
  watch: {
    currentEvent(val) {
      this.updateFeed();
    },
  },
  components: {
    linkify,
  },
  methods: {
    newFeedItem() {
      const newFeedItem = {
        _id: generateID(),
        event: this.currentEvent._id,
        text: '',
        time: Date.now(),
      };
      this.selectedFeedItem = newFeedItem;
      this.showDialog = true;
    },
    selectFeedItem(feeditem) {
      this.selectedFeedItem = _.merge({}, feeditem);
      this.showDialog = true;
    },
    async deleteFeedItem(feeditem) {
      await deleteFeed({ _id: feeditem._id });
      this.updateFeed();
    },
    async saveFeedItem() {
      this.selectedFeedItem.time = Date.now();
      this.showDialog = false;
      await updateFeed(this.selectedFeedItem);
      this.updateFeed();
    },
    async updateFeed() {
      if (this.currentEvent) {
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
      return text.length > 200 ? `${text.substr(0, 197)}...` : text;
    },
  },
};
