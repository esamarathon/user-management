<template>
  <div class="layout-column">
    <h1>Runs</h1>
    <md-tabs class="dark-tabs" :md-active-tab="currentRoundName" @md-changed="updateCurrentRound">
      <md-tab v-for="round in rounds" :key="round.name" :md-label="round.name" :id="round.name"></md-tab>
    </md-tabs>
    <md-table class="runs transparent-table" v-model="runList" md-sort="id" v-if="runList">
      <colgroup>
        <col style="width: 10%">
        <col style="width: 10%">
        <col style="width: 10%">
        <col style="width: 10%">
        <col style="width: 10%">
        <col>
      </colgroup>
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Submitted by" md-sort-by="userName">{{item.userName}}</md-table-cell>
        <md-table-cell md-label="Name" md-sort-by="name">{{item.name}}</md-table-cell>
        <md-table-cell md-label="Platform" md-sort-by="platform">{{item.platform}}</md-table-cell>
        <md-table-cell md-label="Players">{{item.players}}</md-table-cell>
        <md-table-cell md-label="Description">{{item.description}}</md-table-cell>
        <md-table-cell md-label="Comment">{{item.comment}}</md-table-cell>
        <md-table-cell md-label="Decision">
          <div class="layout-row">
            <div class="layout-column flex-none">
              <div class="layout-row flex-none">
                <md-button v-for="button in currentRound.buttons" :key="button.value" @click="decide(item, button.value)"
                class="md-icon-button decision-button flex-none" :class="{'active-decision': item.decision[currentRoundName] === button.value}">
                  <md-icon :style="{color: item.decision[currentRoundName] === button.value ? button.color : 'white'}">{{button.icon}}</md-icon>
                  <md-tooltip md-direction="bottom">{{button.title}}</md-tooltip>
                </md-button>
              </div>
              <div class="layout-row flex-none">
                Other decisions here...
              </div>
            </div>
            <md-field class="flex explanation-field compact">
              <md-textarea md-autogrow placeholder="Explanation" v-model="item.explanation[currentRoundName]" @change="decide(item)"></md-textarea>
            </md-field>
          </div>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script src="./runs.js">
</script>

<style lang="scss">
.md-icon-button.decision-button i.md-icon.md-theme-default.md-icon-font {
  color: white;
}

.md-icon-button.decision-button {
  margin: 0 -5px;
}

.explanation-field {
  padding: 2px;
  textarea.md-textarea {
    color: white;
    -webkit-text-fill-color: unset !important;
  }
}

.explanation-field {
  textarea::-webkit-input-placeholder {
    color: rgba(255,255,255,0.5) !important;
  }

  &:after {
    background-color: rgba(255,255,255,0.7) !important;
  }
}
</style>
