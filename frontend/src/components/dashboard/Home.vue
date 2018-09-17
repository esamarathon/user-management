<template>
  <div class="layout-column">
    <h1>Recent events</h1>
    <div class="eventlist">
      <div class="event" v-for="event in events" :key="event.id">
        <span class="event-category" :class="event.category">{{event.category}}</span>
        <span class="event-type" :class="event.type">{{event.type}}</span>
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
        category: 'run',
        type: 'decline',
        text: 'Your run Baten Kaitos 100% was declined.',
        link: { name: 'SubmissionDetails', params: { id: '1234' } },
      },
      {
        id: '927g3to78ot',
        category: 'run',
        type: 'accept',
        text: 'Your run Xrodon Any% was declined.',
        link: { name: 'SubmissionDetails', params: { id: '1233' } },
      },
      {
        id: '23t8zg783r',
        category: 'volunteering',
        type: 'accept',
        text: 'Your volunteer application for memer was accepted.',
        link: { name: 'ApplicationDetails', params: { id: '420' } },
      },
    ],
  }),
};
</script>

<style lang="scss">
.event {
  padding: 12px;
  background-color: rgba(0,0,0,0.5);
  margin-bottom: 8px;

  .event-category, .event-type {
    padding: 2px 8px;
    border-radius: 5px;
  }

  .event-type {
    margin-right: 8px;
  }

  .event-category.run {
    background-color: #006dd3;
  }

  .event-category.volunteering {
    background-color: rgb(199, 169, 0);
  }

  .event-type.decline {
    background-color: #D12746;
  }

  .event-type.accept {
    background-color: #13AD13;
  }
}
</style>
