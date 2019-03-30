<template>
  <div class="layout-column flex-100 content-holder" v-if="currentEvent">
    <h1>Runs submitted to {{currentEvent.name}}</h1>
    <div class="table-header layout-row">
      <div class="infinite-td flex-10 view"></div>
      <div class="infinite-td flex-30 name">Name</div>
      <div class="infinite-td flex-30 runners">Runner(s)</div>
      <div class="infinite-td flex-20 estimate">Platform</div>
      <div class="infinite-td flex-10 platform">Estimate</div>
    </div>
    <RecycleScroller class="infinite-table flex-100" :items="runs" :item-size="55" key-field="_id">
      <template v-slot="{ item }">
        <div class="infinite-tr run layout-row layout-start-center">
          <div class="infinite-td flex-10 view">
            <md-button class="md-icon-button" @click="selectRun(item)"><md-icon>remove_red_eye</md-icon></md-button>
          </div>
          <div class="infinite-td flex-30 name">{{item.game}} ({{item.category}} {{item.runType}})</div>
          <div class="infinite-td flex-30 runners">{{getRunners(item)}}</div>
          <div class="infinite-td flex-20 platform">{{item.platform}}</div>
          <div class="infinite-td flex-10 estimate">{{item.estimate}}</div>
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
  </div>
</template>

<script src="./publicsubmissions.js">
</script>

<style lang="scss">
.content-holder {
  max-height: calc(100vh - 80px);
}

.infinite-table, .table-header {
  font-size: 12px;
  .infinite-td {
    font-size: 13px;
    padding: 6px 32px 6px 24px;
  }

  .infinite-tr {
    transition: .3s cubic-bezier(.4,0,.2,1);
    transition-property: background-color;
    will-change: background-color;
    &:hover {
      background-color: rgba(255,255,255,0.1);
    }
    border-top: 1px solid rgba(255,255,255,0.12);
  }
}

.run {
  height: 55px;
}

.width-200 {
  width: 200px;
}
</style>
