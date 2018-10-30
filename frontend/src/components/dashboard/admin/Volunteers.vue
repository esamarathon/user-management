<template>
  <div class="layout-column" v-if="currentEvent">
    <h1>Volunteer applications for {{currentEvent.name}}</h1>

    <md-tabs md-sync-route class="transparent-tabs" v-if="volunteersByRole">
      <md-tab v-for="role in eventRoles" :key="role._id" :md-label="role.name" :to="`/dashboard/admin/volunteers/${role.name.toLowerCase()}`">
        <volunteer-table :volunteers="volunteersByRole.get(role._id)" :role="role"></volunteer-table>
      </md-tab>
    </md-tabs>
  </div>
</template>

<script src="./volunteers.js">
</script>

<style lang="scss">
</style>
