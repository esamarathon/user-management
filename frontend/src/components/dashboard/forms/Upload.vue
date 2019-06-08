<template>
  <div class="layout-column layout-start-start">
    <input type="file" class="hidden" id="fileInput" name="fileInput" ref="fileInput" accept="audio/mp3" @change="upload">
    <div class="layout-row layout-start-center">
      <md-button class="md-primary md-raised" @click="choose()">Choose file...</md-button>
      {{chosenFileName}}
      <div class="uploadStatus">
        <md-progress-spinner :md-diameter="24" :md-stroke="3" md-mode="indeterminate" v-if="status === 1"></md-progress-spinner>
        <md-icon class="upload-successful" v-if="status === 2">check</md-icon>
        <md-icon class="upload-failed" v-if="status === 3">close</md-icon>
      </div>
    </div>
    <div v-if="chosenValue">
      <audio controls :src="chosenValue"></audio>
    </div>
  </div>
</template>

<script src="./upload.js">
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}

.uploadStatus {
  margin-left: 8px;

  .upload-successful {
    color: green;
  }
  .upload-failed {
    color: darkred;
  }
}
</style>
