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
      <div class="infinite-td flex-10 status orderable" :class="'order-'+(orderDirections.status || 'none')" @click="toggleOrder('status')">Status</div>
      <div class="infinite-td flex-30 name orderable" :class="'order-'+(orderDirections.name || 'none')" @click="toggleOrder('name')">Name</div>
      <div class="infinite-td flex-20 runners orderable" :class="'order-'+(orderDirections.runners || 'none')" @click="toggleOrder('runners')">Runner(s)</div>
      <div class="infinite-td flex-20 platform orderable" :class="'order-'+(orderDirections.platform || 'none')" @click="toggleOrder('platform')">Platform</div>
      <div class="infinite-td flex-10 estimate orderable" :class="'order-'+(orderDirections.estimate || 'none')" @click="toggleOrder('estimate')">Estimate</div>
    </div>
    <RecycleScroller class="infinite-table flex-100" :items="runList" :item-size="itemSize" key-field="_id">
      <template v-slot="{ item }">
        <div class="infinite-tr run layout-row layout-start-center" :class="`run-${item.status}`">
          <div class="infinite-td flex-5 status layout-row layout-center-center">
            <md-button class="md-icon-button flex-none" @click="selectRun(item)"><md-icon>remove_red_eye</md-icon></md-button>
            <md-icon class="flex-none status-icon" v-if="statusIcon[item.status]">{{statusIcon[item.status]}}<md-tooltip md-direction="bottom">{{item.status}}</md-tooltip></md-icon>
          </div>
          <div class="flex info-items layout-row">
            <div class="infinite-td flex-30 name">{{item.name}}</div>
            <div class="infinite-td flex-20 runners"><span class="mobile-description">Runners: </span>{{item.runners}}</div>
            <div class="infinite-td flex-20 platform"><span class="mobile-description">Platform: </span>{{item.platform}}</div>
            <div class="infinite-td flex-10 estimate"><span class="mobile-description">Estimate: </span>{{item.estimate}}</div>
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
  </div>
</template>

<script src="./publicsubmissions.js">
</script>

<style lang="scss" scoped>
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

.table-header .infinite-td.orderable {
  cursor: pointer;
  &:before {
    content: 'arrow_upward';
    font-family: 'Material Icons';
    position: relative;
    top: 2px;
    margin-right: 8px;
    transition: transform 0.25s;
    display: inline-block;
  }
  &.order-none:before {
    visibility: hidden;
  }
  &.order-asc:before {
    transform: rotate(180deg);
  }
  &.order-desc:before {
  }
}

.infinite-tr {
    border-left: 2px solid transparent;
  &.run-accepted {
    border-left-color: #33cc33;
    .status-icon {
      color: #33cc33;
    }
  }
  &.run-rejected {
    border-left-color: #cc3333;
    .status-icon {
      color: #cc3333;
    }
  }
}

.run {
  height: 55px;
}

.width-200 {
  width: 200px;
}

.mobile-description {
  display: none;
}

@media (max-width: 1000px) {
  .infinite-table {
    .infinite-td {
      padding: 0;
    }
  }
  .table-header {
    display: none;
  }
  .infinite-tr .info-items {
    flex-direction: column;
  }
  .run {
    height: 140px;
  }
  .infinite-td.name {
    font-size: 16px;
    font-weight: bold;
  }
  .mobile-description {
    display: initial;
    font-weight: bold;
  }
}
</style>
