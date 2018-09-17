import _ from 'lodash';

import defaultSettings from '../../shared/src/settings.default.json';
import sharedSettings from '../../settings.json';
import frontendSettings from '../../settings.frontend.json';

const settings = _.merge({}, defaultSettings, sharedSettings, frontendSettings);
export default settings;
