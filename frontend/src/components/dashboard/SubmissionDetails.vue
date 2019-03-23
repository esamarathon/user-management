<template>
  <div class="layout-column" v-if="submission">
    <h1>Submission details for {{name}} at {{submission.event.name}}</h1>
    {{submission}}
    <div class="submission-details layout-column">
      <!--<div class="details-row layout-row">
        <div class="flex-25">Submission ID</div>
        <div class="flex">{{submission._id}}</div>
      </div>-->
      <div class="details-row layout-row">
        <div class="flex-25">Name</div>
        <div class="flex">{{name}}</div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25">Status</div>
        <div class="flex">{{submission.status}}</div>
      </div>
    </div>
  </div>
</template>

<script src="./submissiondetails.js">
</script>

<style lang="scss">
</style>
