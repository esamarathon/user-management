<template>
  <div class="form-edit layout-padding">
    <div class="form-question md-card">
      <md-field v-if="editing">
        <label>Question title</label>
        <md-input v-model="question.title"></md-input>
      </md-field>
      <md-field v-if="editing">
        <label>Question type</label>
        <md-select v-model="question.type" name="event" id="event">
          <md-option v-for="questionType in questionTypes" :value="questionType.value" :key="questionType.value">{{questionType.name}}</md-option>
        </md-select>
      </md-field>
      <div v-if="editing">
        <ListEdit v-for="list in getQuestionLists(question)" :key="list.name" :placeholder="`Add new ${list.name} ...`" v-model="question.options[list.name]"></ListEdit>
      </div>
      <h2 v-if="!editing">{{question.title}}</h2>
      <md-field v-if="!editing">
        <div :is="question.type" v-model="question.value" :options="question.options"></div>
      </md-field>
    </div>
  </div>
</template>

<script src="./formedit.js"></script>

<style lang="scss" scoped>
.form-question {
  margin-bottom: 12px;
}
</style>
