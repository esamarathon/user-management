import _ from 'lodash';
import MultipleChoice from './MultipleChoice';
import ListEdit from './ListEdit';
import Dropdown from './Dropdown';
import ShortText from './ShortText';
import LongText from './LongText';

export default {
  name: 'FormDisplay',
  data: () => ({
    questionTypes: [{
      name: 'Short text',
      value: 'ShortText',
    }, {
      name: 'Long text',
      value: 'LongText',
    }, {
      name: 'Multiple choice',
      value: 'MultipleChoice',
      lists: [{
        name: 'options',
      }],
    }, {
      name: 'Dropdown',
      value: 'Dropdown',
      lists: [{
        name: 'options',
      }],
    }],
    chosenValue: null,
  }),
  components: {
    MultipleChoice, ListEdit, Dropdown, ShortText, LongText,
  },
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
