<template>
  <div>
    <div v-for="item in values" :key="item.id">
      <md-field class="compact">
        <md-input :placeholder="placeholder" v-model="item.text" @input="updateList()"></md-input>
      </md-field>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    values: []
  }),
  created() {
    if (this.value)
      this.values = this.value.map(item => ({
        id: "" + Math.random(),
        text: item
      }));
    this.updateList();
  },
  props: ["placeholder", "value"],
  methods: {
    updateList() {
      console.log("List before purge", this.values);
      // purge empty items
      this.values = this.values.filter(item => item.text);
      console.log("List after purge", this.values);
      this.$emit("input", this.values.map(item => item.text));
      this.values.push({
        id: "" + Math.random(),
        text: ""
      });
    }
  }
};
</script>
