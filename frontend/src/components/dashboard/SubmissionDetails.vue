<template>
  <div class="layout-column" v-if="s">
    <h1>Submission details for {{name}} at {{event.name}}</h1>
    <div class="submission-details layout-column">
      <div class="details-row layout-row">
        <div class="flex-25">Submit by</div>
        <div class="flex"><a :href="s.user.connections.srdotcom && `https://speedrun.com/user/${s.user.connections.srdotcom.name}`">{{s.user.connections.twitch.displayName}}</a></div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25">Name</div>
        <div class="flex"><a :href="s.leaderboards">{{name}}</a></div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25">Status</div>
        <div class="flex">{{s.status}}</div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25">Estimate</div>
        <div class="flex">{{s.estimate}}</div>
      </div>
      <div class="details-row layout-row" v-if="s.runType !== 'solo'">
        <div class="flex-25">Teams</div>
        <div class="flex">{{teamString}}</div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25">Category</div>
        <div class="flex">{{s.category}}</div>
      </div>
      <div class="details-row layout-row">
        <div class="flex-25 noshrink">Comment</div>
        <div class="flex pre">{{s.comment}}</div>
      </div>
      <div class="details-row layout-column incentive" v-for="i in incentives" :key="i._id">
        <div class="incentive-header layout-row layout-between-center"><span>{{i.name}}</span><span class="incentive-type">Incentive</span></div>
        <div class="incentive-body layout-column">
          <div class="flex pre">{{i.description}}</div>
        </div>
      </div>
      <div class="details-row layout-column incentive" v-for="i in bidwars" :key="i._id">
        <div class="incentive-header layout-row layout-between-center"><span>{{i.name}}</span><span class="incentive-type">Bid war</span></div>
        <div class="incentive-body layout-column">
          <div class="flex pre">{{i.description}}</div>
          <div class="flex pre" v-if="i.bidwarType === 'options'">Options:<br>{{i.options}}</div>
          <div class="flex pre" v-if="i.bidwarType === 'freeform'">Free form input: {{i.freeformMin}} - {{i.freeformMax}} characters</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./submissiondetails.js">
</script>

<style lang="scss">
.pre {
  white-space: pre-wrap;
}

.noshrink {
  flex-shrink: 0;
}

.incentive {
  background-color: rgba(0,0,0,0.5);
  margin: 8px;
  .incentive-header {
    text-transform: capitalize;
    background-color: #2f4f86;
    padding: 8px;
  }
  .incentive-body {
    padding: 8px;
  }
  .incentive-type {
    font-size: small;
    color: rgba(255,255,255,0.75);
  }
}
</style>
