<template>
  <md-table class="volunteer-table transparent-table" v-model="volunteerList" md-sort="name" v-if="volunteerList">
    <md-table-row :key="item._id" slot="md-table-row" slot-scope="{ item }">
      <md-table-cell md-label="Name" md-sort-by="name">{{item.name}}</md-table-cell>
      <md-table-cell v-for="question in role.form" :key="question._id" :md-label="question.title" :md-sort-by="'questions.'+question._id">
        <pretty-format :val="getAnswer(item, question)" :type="typeof(getAnswer(item, question))"></pretty-format>
      </md-table-cell>
    </md-table-row>
  </md-table>
</template>

<script src="./volunteerTable.js">
</script>

<style lang="scss">

</style>

