import _ from 'lodash';
import { questionTypes, components } from './questiontypes';

export default {
  name: 'FormDisplay',
  data: () => ({
    questionTypes,
    chosenValue: null,
  }),
  components,
  props: ['question', 'value'],
  created() {
    if (this.value) {
      this.chosenValue = this.value;
    }
  },
  methods: {
    updateValue() {
      console.log('Form value for question', this.question, 'updated to', this.chosenValue);
      this.$emit('input', this.chosenValue);
    },
  },
};
