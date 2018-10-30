<template>
  <md-field>
    <md-textarea v-model="chosenValue" @change="updateValue()"></md-textarea>
  </md-field>
</template>

<script>
export default {
  name: "ShortText",
  data: () => ({
    chosenValue: null
  }),
  props: ['value'],
  created() {
    this.chosenValue = this.value;
  },
  methods: {
    updateValue() {
      this.$emit('input', this.chosenValue);
    },
  },
}
</script>
