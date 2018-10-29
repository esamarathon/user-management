import _ from 'lodash';
import MultipleChoice from './MultipleChoice';
import ListEdit from './ListEdit';
import Dropdown from './Dropdown';

export default {
  name: 'FormEdit',
  data: () => ({
    questionTypes: [{
      name: 'Short text',
      value: 'mdInput',
    }, {
      name: 'Long text',
      value: 'mdTextarea',
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
    MultipleChoice, ListEdit, Dropdown,
  },
  props: ['question', 'editing'],
  created() {
  },
  methods: {
    getQuestionLists(question) {
      console.log('Question lists:', _.find(this.questionTypes, { value: question.type }).lists);
      return _.find(this.questionTypes, { value: question.type }).lists;
    },
  },
};
