<template>
  <div class="flex-100 layout-column">
    <div class="multiple-choice-table layout-column flex-none">
      <div class="multiple-choice-table-headers layout-row flex-none">
        <div class="multiple-choice-table-header flex-25 layout-row layout-center-center" v-for="x in ['', 'Very', 'Somewhat', 'A little', 'Not at all']" :key="x">
          <span>{{x}}</span>
        </div>
      </div>
      <div class="multiple-choice-table-row layout-row flex-none" v-for="type in options.options" :key="type">
        <div class="multiple-choice-table-cell flex-25">{{type}}</div>
        <div class="multiple-choice-table-cell flex-25 layout-row layout-center-center" v-for="i in ['Very', 'Somewhat', 'A little', 'Not at all']" :key="i" >
          <md-radio :value="i" v-model="choices[type]" @change="updateChoices()" class="flex-none"></md-radio>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MultipleChoice",
  props: ['options', 'editing', 'value'],
  data: ()=>({
    choices: {},
    dummy: 0
  }),
  created() {
    console.log("Initializing choices with", this.value);
    if(this.value) this.choices = this.value;
  },
  methods: {
    updateChoices() {
      this.$emit('input', this.choices)
    }
  }
}
</script>

<style lang="scss">
.multiple-choice-table .md-radio {
  margin: 16px;
}
</style>
