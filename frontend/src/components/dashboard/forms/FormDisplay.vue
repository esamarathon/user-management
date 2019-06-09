<template>
  <div class="form-display layout-padding">
    <div class="form-question">
      <h2>{{question.title}}<span class="required" v-if="question.required">*</span></h2>
      <p class="description">{{question.description}}</p>
      <div :is="question.type" v-model="chosenValue" :options="question.options" @input="updateValue()"></div>
    </div>
  </div>
</template>

<script src="./formdisplay.js"></script>

<style lang="scss" scoped>
.form-question {
  margin-bottom: 12px;

  .required {
    margin-left: 8px;
    color: #FF5500;
  }

  .description {
    white-space: pre-line;
  }
}
</style>
