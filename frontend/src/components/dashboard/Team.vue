<template>
  <div class="team layout-column">
    <div class="header">
      <md-field class="small-field flex-none">
        <label for="teamname">Team name</label>
        <md-input name="teamname" id="teamname" v-model="info.name" @change="update()" :disabled="disabled" />
      </md-field>
    </div>
    <div class="members layout-column">
      <span class="compact-title">Members:</span>
      <draggable v-model="info.members" group="members" class="drag-target" tag="div" :disabled="disabled" :class="{'disabled-draggable': disabled}">
        <div class="member" v-for="member in info.members" :key="member._id" :class="member.status">
          <img :src="member.user.connections.twitch.logo" class="profilepic invitation"> {{member.user.connections.twitch.displayName}}
        </div>
      </draggable>
    </div>
  </div>
</template>

<script src="./team.js">
</script>

<style lang="scss" scoped>
.team {

  .header {
    padding: 8px;
    background-color: rgba(0,0,0,0.2);

    input {
      font-size: large;
    }
  }

  .members {
    .compact-title {
      font-size: large;
    }

    padding: 8px;
  }
}

.drag-target {
  background-color: rgba(200,200,255,0.1);
  border: 1px dashed rgba(200,200,255,0.5);
  min-height: 50px;
  position: relative;
  padding: 4px;

  &:empty:before {
    content: 'Drag members here';
    width: 100%;
    display: block;
    text-align: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255,255,255,0.8);
  }
}
</style>
