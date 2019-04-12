<template>
  <div>
    <div v-if="status==='ask'">
      Are you sure you want to unsubscribe from all emails to {{token.email}}?<br>
      <md-button @click="unsubscribe()" class="md-accent md-raised">Yes</md-button>
      <md-button :to="{name:'Profile'}" class="md-primary md-raised">Manage preferences</md-button>
    </div>
    <div v-if="status==='done'">
      Your preferences have been updated.<br>
      <md-button :to="{name:'Profile'}" class="md-primary md-raised">Manage preferences</md-button>
    </div>
    <div v-if="status==='notoken'">
      You have to click the URL in the email to be able to unsubscribe from all notifications for that email.<br>
      <md-button :to="{name:'Profile'}" class="md-primary md-raised">Manage preferences</md-button>
    </div>
  </div>
</template>

<script src="./unsubscribe.js">
</script>
