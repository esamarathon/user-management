<template functional>
  <div>
    <div v-if="typeof(props.val) === 'object'">
      <div v-for="(answer, key) in props.val" :key="key">{{key}}: {{answer}}</div>
    </div>
    <div v-else-if="props.type === 'Upload'" class="audio-player">
      <audio controls preload="meta" :src="props.val"></audio>
    </div>
    <div v-else>
      {{props.val}}
    </div>
  </div>
</template>

<script>
export default {
  name: "PrettyFormat",
  props: ['val', 'type'],
}
</script>

<style lang="scss">
.audio-player audio {
  height: 25px;
}
</style>
