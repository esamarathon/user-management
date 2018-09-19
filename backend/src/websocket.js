import logger from './logger';

export function handleWebsocket(connection, req) {
  logger.debug('Client connecting for user: ', req.user);

  connection.on('message', message => {
    logger.debug('Client message received:', message);
  });
}
