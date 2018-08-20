<template>
  <div id="app" class="layout-column layout-center-center">
    <md-progress-spinner md-mode="indeterminate" class="flex-none"></md-progress-spinner>
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    // here we want to check if the JWT is valid etc. If it is, redirect to /dashboard. Else, redirect to /login
    setTimeout(() => {
      this.$router.push({ name: 'Dashboard' });
    }, 1500);
  },
};
</script>

<style lang="scss">
</style>
