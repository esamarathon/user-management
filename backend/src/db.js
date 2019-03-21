import mongoose from 'mongoose';
import settings from './settings';
import logger from './logger';

const db = mongoose.connection;

const promise = new Promise(resolve => {
  let hasConnectedBefore = false;
  function connect() {
    mongoose.connect(settings.db.url, { server: { auto_reconnect: true } });
  }

  db.on('connecting', () => {
    logger.info('Connecting to MongoDB...');
  });
  db.on('error', error => {
    logger.error('Error in MongoDB connection:', error);
    mongoose.disconnect();
  });
  db.on('connected', () => {
    if (!hasConnectedBefore) resolve();
    hasConnectedBefore = true;
    logger.info('Connected to MongoDB.');
  });
  db.on('open', () => {
    logger.info('Connection to MongoDB opened.');
  });
  db.on('reconnected', () => {
    logger.info('Reconnected to MongoDB.');
  });
  db.on('disconnected', () => {
    logger.warn('MongoDB disconnected! Retrying in 5...');
    if (!hasConnectedBefore) setTimeout(connect, 5000);
  });

  // Close the Mongoose connection, when receiving SIGINT
  process.on('SIGINT', () => {
    db.close(() => {
      console.log('Force to close the MongoDB conection');
      process.exit(0);
    });
  });

  connect();
});

export default promise;
