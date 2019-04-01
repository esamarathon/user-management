import db from './db';
import migrate from './migrate';
import logger from './logger';

db.then(async () => {
  logger.info('Running migrations...');
  await migrate();
  logger.info('Migrations done, starting server...');
  require('./routes'); // eslint-disable-line global-require
});
