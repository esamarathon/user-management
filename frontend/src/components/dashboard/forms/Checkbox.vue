<template>
  <div class="layout-column flex-100">
    <div v-for="option in options.options" :key="option">
      <md-checkbox v-model="choice" :value="option" @change="updateChoice()">{{option}}</md-checkbox>
    </div>
  </div>
</template>

<script>
export default {
  name: "Checkbox",
  props: ['options', 'editing', 'value'],
  data: ()=>({
    choice: []
  }),
  created() {
    if(this.value) this.choice = this.value;
  },
  methods: {
    updateChoice() {
      console.log("Updating checkbox with value", this.choice);
      this.$emit('input', this.choice)
    }
  }
}
</script>
