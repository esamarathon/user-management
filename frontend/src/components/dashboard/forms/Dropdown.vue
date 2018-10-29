<template>
  <md-field>
    <md-select v-model="value">
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
      this.$emit('input', this.value)
    }
  }
}
</script>
