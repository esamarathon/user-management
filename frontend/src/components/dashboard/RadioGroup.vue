<template>
  <div class="radio-group">
    <md-radio v-for="i in [4,3,2,1]" :key="i" :value="i" v-model="groupVal" @change="change">{{i}}</md-radio>
  </div>
</template>

<script>
export default {
  name: "RadioGroup",
  props: ["value"],
  data: () => ({
    groupVal: null
  }),
  created() {
    this.groupVal = this.value;
  },
  methods: {
    change(val) {
      this.$emit("input", this.groupVal);
    }
  },
  watch: {
    value(newVal) {
      this.groupVal = newVal;
    }
  }
};
</script>

