<template>
  <div class="form-edit layout-padding">
    <div class="form-question layout-column">
      <div class="layout-row">
        <md-field>
          <label>Question title</label>
          <md-input v-model="question.title" class="flex-100"></md-input>
        </md-field>
      </div>
      <md-switch v-model="question.required">Required</md-switch>
      <md-field>
        <label>Question description</label>
        <md-textarea md-autogrow v-model="question.description"></md-textarea>
      </md-field>
      <md-field>
        <label>Question type</label>
        <md-select v-model="question.type" name="event" id="event">
          <md-option v-for="questionType in questionTypes" :value="questionType.value" :key="questionType.value">{{questionType.name}}</md-option>
        </md-select>
      </md-field>
      <div>
        <ListEdit v-for="list in getQuestionLists(question.type)" :key="list.name" :placeholder="`Add new ${list.name} ...`" v-model="question.options[list.name]"></ListEdit>
      </div>
    </div>
  </div>
</template>

<script src="./formedit.js"></script>

<style lang="scss" scoped>
.form-question {
  margin-bottom: 12px;
}
</style>
