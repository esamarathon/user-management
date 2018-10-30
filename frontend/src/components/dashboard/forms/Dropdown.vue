<template>
  <md-field>
    <md-select v-model="choice" @md-selected="updateChoices()">
      <md-option v-for="option in options.options" :key="option" :value="option">{{option}}</md-option>
    </md-select>
  </md-field>
</template>

<script>
export default {
  name: "Dropdown",
  props: ['options', 'editing', 'value'],
  data: ()=>({
    choice: null
  }),
  created() {
    this.choice = this.value;
  },
  methods: {
    updateChoices() {
      console.log("Updating dropdown with value", this.choice);
      this.$emit('input', this.choice)
    }
  }
}
</script>
