<template>
  <div>
    <md-field>
      <md-input v-model="chosenValue" @change="updateValue()"></md-input>
    </md-field>
  </div>
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
