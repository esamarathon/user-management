import _ from 'lodash';

import defaultSettings from '../../config.default.json';
import frontendSettings from '../../config.frontend.json';

const settings = _.merge({}, defaultSettings, frontendSettings);
export default settings;
