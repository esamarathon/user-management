<template>
  <div class="form-display layout-padding">
    <div class="form-question">
      <h2>{{question.title}}</h2>
      <p>{{question.description}}</p>
      <div :is="question.type" v-model="chosenValue" :options="question.options" @input="updateValue()"></div>
    </div>
  </div>
</template>

<script src="./formdisplay.js"></script>

<style lang="scss" scoped>
.form-question {
  margin-bottom: 12px;
}
</style>
