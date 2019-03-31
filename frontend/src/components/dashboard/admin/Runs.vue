<template>
  <div class="layout-column" v-if="currentEvent">
    <h1>Runs submitted to {{currentEvent.name}}</h1>
    <div class="layout-row layout-between-start">
      <md-tabs class="transparent-tabs flex-none" :md-active-tab="currentRoundName" @md-changed="updateCurrentRound">
        <md-tab v-for="round in rounds" :key="round.name" :md-label="round.name" :id="round.name"></md-tab>
      </md-tabs>
      <div class="flex">
        <md-field>
          <label>Show columns...</label>
          <md-select multiple v-model="activeColumns">
            <md-option v-for="column in columns" :key="column" :value="column">{{column}}</md-option>
          </md-select>
        </md-field>
      </div>
    </div>
    <md-table class="runs transparent-table" v-model="runList" md-sort="id" v-if="runList">
      <md-table-row slot="md-table-row" slot-scope="{ item }" :style="{'border-left-color': getStatusIndicatorColor(item)}">
        <md-table-cell>
          <div class="layout-column">
            <div><md-button class="md-icon-button" @click="viewRun(item)"><md-icon>remove_red_eye</md-icon></md-button></div>
            <div><md-button class="md-icon-button" @click="editRun(item)"><md-icon>edit</md-icon></md-button></div>
          </div>
        </md-table-cell>
        <md-table-cell v-if="showColumns['Submitted by']" md-label="Submitted by" md-sort-by="userName">
          {{item.userName}}
        </md-table-cell>
        <md-table-cell v-if="showColumns['Name']" md-label="Name" md-sort-by="name" class="textbreak width-200">{{item.name}}</md-table-cell>
        <md-table-cell v-if="showColumns['Platform']" md-label="Platform" md-sort-by="platform" class="textbreak">{{item.data.platform}}</md-table-cell>
        <md-table-cell v-if="showColumns['Estimate']" md-label="Estimate" md-sort-by="estimate" class="textbreak">{{item.data.estimate}}</md-table-cell>
        <md-table-cell v-if="showColumns['Players']" md-label="Players">{{item.players}}</md-table-cell>
        <md-table-cell v-if="showColumns['Comment']" md-label="Comment" class="textbreak">{{item.data.comment}}</md-table-cell>
        <md-table-cell v-if="showColumns['Video']" md-label="Video"><video-button :url="item.data.video"></video-button></md-table-cell>
        <md-table-cell v-if="showColumns['Decision']" md-label="Decision">
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
    <md-dialog :md-active.sync="showDialog" class="big-dialog">
      <md-dialog-title>Run details</md-dialog-title>
      <md-dialog-content ref="dialog">
        <submission-details :submission="selectedRun"></submission-details>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
    <submission-edit :selectedSubmission="selectedRun2" @submit="saveRun" @cancel="showDialog2=false" :showDialog.sync="showDialog2"></submission-edit>
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

.md-table.runs .md-table-row {
  border-left: 5px solid transparent;
}

.textbreak {
  word-break: break-word;
}

.width-200 {
  width: 200px;
}
</style>
