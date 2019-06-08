import _ from 'lodash';
import { questionTypes, components } from './questiontypes';

export default {
  name: 'FormEdit',
  data: () => ({
    questionTypes,
  }),
  components,
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
