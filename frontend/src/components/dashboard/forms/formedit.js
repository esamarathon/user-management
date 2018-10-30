import _ from 'lodash';
import MultipleChoice from './MultipleChoice';
import ListEdit from './ListEdit';
import Dropdown from './Dropdown';
import ShortText from './ShortText';
import LongText from './LongText';

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
  },
  methods: {
    getQuestionLists(question) {
      console.log('Question lists:', _.find(this.questionTypes, { value: question.type }).lists);
      return _.find(this.questionTypes, { value: question.type }).lists;
    },
  },
};
