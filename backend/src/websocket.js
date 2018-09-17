import logger from './logger';

export function handleWebsocket(connection) {
  logger.debug('Client connecting');

  connection.on('message', message => {
    logger.debug('Client message received:', message);
  });
}
