import MultipleChoice from './MultipleChoice.vue';
import ListEdit from './ListEdit.vue';
import Dropdown from './Dropdown.vue';
import Checkbox from './Checkbox.vue';
import ShortText from './ShortText.vue';
import LongText from './LongText.vue';
import Empty from './Empty.vue';
import Upload from './Upload.vue';

export const questionTypes = [{
  name: 'Short text',
  value: 'ShortText',
}, {
  name: 'Long text',
  value: 'LongText',
}, {
  name: 'Info',
  value: 'Empty',
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
}, {
  name: 'Checkbox',
  value: 'Checkbox',
  lists: [{
    name: 'options',
  }],
}, {
  name: 'Upload mp3',
  value: 'Upload',
}];

export const components = {
  MultipleChoice, ListEdit, Dropdown, ShortText, LongText, Checkbox, Empty, Upload,
};
