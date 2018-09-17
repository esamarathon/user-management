import pino from 'pino';

import settings from './settings';

const logger = pino({
  name: settings.logger.name,
  level: settings.logger.level,
  prettyPrint: {
    levelFirst: true,
    forceColor: true
  }
});

// Disable stdout for testing
if (process.env.NODE_ENV === 'test') {
  logger.level = 'silent';
}

export default logger;
