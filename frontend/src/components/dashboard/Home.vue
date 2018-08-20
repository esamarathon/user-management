<template>
  <div class="layout-column">
    <h1>Recent events</h1>
    <div class="eventlist">
      <div class="event" v-for="event in events" :key="event.id">
        <span class="event-type">{{event.type}}</span>
        <span class="event-text">{{event.text}}</span>
        <span class="event-link"><router-link :to="event.link">Details</router-link></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data: () => ({
    events: [
      {
        id: '23gtozigw37t',
        type: 'run:decline',
        text: 'Your run Baten Kaitos 100% was declined.',
        link: { name: 'SubmissionDetails', params: { id: '1234' } },
      },
      {
        id: '927g3to78ot',
        type: 'run:accept',
        text: 'Your run Xrodon Any% was declined.',
        link: { name: 'SubmissionDetails', params: { id: '1233' } },
      },
      {
        id: '23t8zg783r',
        type: 'volunteer:accept',
        text: 'Your volunteer application for memer was accepted.',
        link: { name: 'ApplicationDetails', params: { id: '420' } },
      },
    ],
  }),
};
</script>

<style lang="scss">
</style>
