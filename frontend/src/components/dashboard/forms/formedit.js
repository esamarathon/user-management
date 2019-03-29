import _ from 'lodash';
import MultipleChoice from './MultipleChoice.vue';
import ListEdit from './ListEdit.vue';
import Dropdown from './Dropdown.vue';
import ShortText from './ShortText.vue';
import LongText from './LongText.vue';

export default {
  name: 'FormEdit',
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
  }),
  components: {
    MultipleChoice, ListEdit, Dropdown, ShortText, LongText,
  },
  props: ['question'],
  created() {
    if (!this.question.options) this.question.options = {};
  },
  methods: {
    getQuestionLists(questionType) {
      console.log('Question lists:', _.find(this.questionTypes, { value: questionType }).lists);
      return _.find(this.questionTypes, { value: questionType }).lists;
    },
  },
};
