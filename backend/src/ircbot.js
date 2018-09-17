import _ from 'lodash';
import net from 'net';
import { EventEmitter } from 'events';
import { createStream } from './irc-message';

import logger from './logger';

export default class IRCBot extends EventEmitter {
  constructor(channels) {
    super();
    this.lastReconnect = 0;
    this.reconnectDebounce = 1;
    this.connection = null;
    this.ircConnection = null;
    this.channels = channels;

    this.connect();
    this.on('PING', () => {
      this.send('PONG');
    });
  }

  connect() {
    logger.info('Connecting bot...');
    this.connection = net.connect(6667, 'irc.chat.twitch.tv');
    this.ircConnection = this.connection.pipe(createStream({ parsePrefix: true }));
    this.ircConnection.on('data', message => {
      this.handleMessage(message);
    });
    this.connection.on('connect', () => {
      logger.info('Bot connected');
      this.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      this.send('NICK justinfan123');
      this.send(`JOIN ${_.map(this.channels, channel => `#${channel.name}`).join(',')}`);
    });
    this.connection.on('close', () => {
      if (Date.now() - this.lastReconnect > 64000) this.reconnectDebounce = 1;
      else this.reconnectDebounce = Math.min(32, this.reconnectDebounce * 2);
      this.lastReconnect = Date.now();
      console.error(`Bot disconnected, reconnecting in ${this.reconnectDebounce} seconds`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectDebounce * 1000);
    });
  }

  send(data) {
    return new Promise(resolve => {
      logger.debug('Sending', data);
      this.connection.write(`${data}\r\n`, resolve);
    });
  }

  handleMessage(message) {
    if (message.params && message.params.length === 1 && /^\W(\w+)$/.exec(message.params[0])) message.channel = message.params[0];
    this.emit(message.command, message);
  }
}
