<template functional>
  <div>
    <div v-if="props.type === 'object'">
      <div v-for="(answer, key) in props.val" :key="key">{{key}}: {{answer}}</div>
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
