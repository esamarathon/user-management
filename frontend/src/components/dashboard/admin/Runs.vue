<template>
  <div class="layout-column flex-100 content-holder" v-if="currentEvent">
    <h1>Runs submitted to {{currentEvent.name}}</h1>
    <div class="flex-none layout-row">
      <md-field class="flex-10">
        <md-icon>search</md-icon>
        <md-input v-model="searchTerm"></md-input>
      </md-field>
    </div>
    <div class="table-header layout-row">
      <div class="infinite-td flex-10 view"></div>
      <div class="infinite-td flex-30 name orderable" :class="'order-'+(orderDirections.name || 'none')" @click="toggleOrder('name')">Name</div>
      <div class="infinite-td flex-30 runners orderable" :class="'order-'+(orderDirections.runners || 'none')" @click="toggleOrder('runners')">Runner(s)</div>
      <div class="infinite-td flex-20 platform orderable" :class="'order-'+(orderDirections.platform || 'none')" @click="toggleOrder('platform')">Platform</div>
      <div class="infinite-td flex-10 estimate orderable" :class="'order-'+(orderDirections.estimate || 'none')" @click="toggleOrder('estimate')">Estimate</div>
      <div class="infinite-td flex-10 estimate">Video</div>
      <div class="infinite-td flex-10 estimate">Decisions</div>
    </div>
    <RecycleScroller class="infinite-table flex-100" :items="runList" :item-size="itemSize" key-field="_id">
      <template v-slot="{ item }">
        <div class="infinite-tr run layout-row layout-start-center">
          <div class="infinite-td flex-10 view">
            <md-button class="md-icon-button" @click="selectRun(item)"><md-icon>remove_red_eye</md-icon></md-button>
          </div>
          <div class="flex info-items layout-row">
            <div class="infinite-td flex-30 name">{{item.name}}</div>
            <div class="infinite-td flex-30 runners"><span class="mobile-description">Runners: </span>{{item.runners}}</div>
            <div class="infinite-td flex-20 platform"><span class="mobile-description">Platform: </span>{{item.platform}}</div>
            <div class="infinite-td flex-10 estimate"><span class="mobile-description">Estimate: </span>{{item.estimate}}</div>
            <div class="infinite-td flex-10 estimate"><span class="mobile-description">Video: </span><video-button :url="item.video"></video-button></div>
            <div class="infinite-td flex-10 estimate"><span class="mobile-description">Decisions: </span>
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
            </div>
          </div>
        </div>
      </template>
    </RecycleScroller>
    <md-dialog :md-active.sync="showDialog" class="big-dialog">
      <md-dialog-title>Run details</md-dialog-title>
      <md-dialog-content ref="dialog">
        <submission-details :submission="selectedRun"></submission-details>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-accent" @click="showDialog = false">Close</md-button>
      </md-dialog-actions>
    </md-dialog>
  <!-- </div>
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
        <md-table-cell class="buttons-cell">
          <div class="layout-column">
            <div class="flex-none"><md-button class="md-icon-button" @click="viewRun(item)"><md-icon>remove_red_eye</md-icon></md-button></div>
            <div v-if="hasAnyPermission('Edit Runs', 'Admin')" class="flex-none layout-row">
              <md-button class="md-icon-button flex-none" @click="editRun(item)"><md-icon>edit</md-icon></md-button>
            </div>
          </div>
        </md-table-cell>
        <md-table-cell v-if="showColumns['Submitted by']" md-label="Submitted by" md-sort-by="userName">
          {{item.userName}}
        </md-table-cell>
        <md-table-cell v-if="showColumns['Name']" md-label="Name" md-sort-by="name" class="textbreak width-200">{{item.name}}</md-table-cell>
        <md-table-cell v-if="showColumns['Platform']" md-label="Platform" md-sort-by="platform" class="textbreak">{{item.data.platform}}</md-table-cell>
        <md-table-cell v-if="showColumns['Estimate']" md-label="Estimate" md-sort-by="estimate" class="textbreak">{{item.data.estimate}}</md-table-cell>
        <md-table-cell v-if="showColumns['Runners']" md-label="Runners">{{item.data.runners}}</md-table-cell>
        <md-table-cell v-if="showColumns['Comment']" md-label="Comment" class="textbreak">{{item.data.comment}}</md-table-cell>
        <md-table-cell v-if="showColumns['Video']" md-label="Video"></md-table-cell>
        <md-table-cell v-if="showColumns['Decision']" md-label="Decision">
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
  </div> -->
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
