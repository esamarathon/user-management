<template>
  <div>
    <md-button class="md-icon-button youtube" v-if="videoInfo.type === 'youtube'" @click="showDialog = true">
      <img src="../../../assets/yt_icon_mono_dark.png">
    </md-button>
    <md-button class="md-icon-button twitch" v-if="videoInfo.type === 'twitch'" @click="showDialog = true">
      <img src="../../../assets/twitch_logo.png">
    </md-button>
    <md-button class="unknown md-icon-button" v-if="videoInfo.type === 'unknown'" :href="url" target="_blank">
      <img :src="'//'+videoInfo.host+'/favicon.ico'" @error="noLogo = true" v-if="!noLogo">
      <span v-if="noLogo">?</span>
    </md-button>
    <md-dialog :md-active.sync="showDialog">
      <iframe class="video-player md-image" :src="videoInfo.embedUrl" allow="autoplay; encrypted-media" allowfullscreen width=960 height=540></iframe>
    </md-dialog>
  </div>
</template>

<script>
import { getVideoData } from '../../../helpers.js'

export default {
  name: 'VideoButton',
  data: ()=>({
    showDialog: false,
    noLogo: false,
  }),
  props: ['url'],
  computed: {
    videoInfo: {
      get() {
        return getVideoData(this.url);
      }
    }
  }
}
</script>

<style lang="scss">
iframe.video-player {
  width: 960px;
  height: 540px;
}
</style>
