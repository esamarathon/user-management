<template>
  <div class="layout-column">
    <h1>Runs</h1>
    <md-tabs class="dark-tabs">
      <md-tab v-for="round in rounds" :key="round.name" :md-label="round.name"></md-tab>
    </md-tabs>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  data: () => ({
    rounds: [{name: "First cut"}, {name: "Second cut"}, {name: "Final selection"}],

  })
};
</script>

<style lang="scss">
.md-tabs.md-theme-default.dark-tabs .md-tabs-navigation {
  background-color: transparent;
  .md-button {
    color: white;
  }
}
</style>
