const through = require('through2');
const parsePrefix = require('irc-prefix-parser');
const iso8601 = require('iso8601-convert');

export function parse(data) {
  const message = {
    raw: data,
    tags: {},
    prefix: null,
    command: null,
    params: []
  };

  // position and nextspace are used by the parser as a reference.
  let position = 0;
  let nextspace = 0;

  // The first thing we check for is IRCv3.2 message tags.
  // http://ircv3.atheme.org/specification/message-tags-3.2

  if (data.charCodeAt(0) === 64) {
    nextspace = data.indexOf(' ');

    if (nextspace === -1) {
      // Malformed IRC message.
      return null;
    }

    // Tags are split by a semi colon.
    const rawTags = data.slice(1, nextspace).split(';');

    for (let i = 0; i < rawTags.length; i++) {
      // Tags delimited by an equals sign are key=value tags.
      // If there's no equals, we assign the tag a value of true.
      const tag = rawTags[i];
      const pair = tag.split('=');
      message.tags[pair[0]] = pair[1] || true;
    }

    position = nextspace + 1;
  }

  // Skip any trailing whitespace.
  while (data.charCodeAt(position) === 32) {
    position++;
  }

  // Extract the message's prefix if present. Prefixes are prepended
  // with a colon.

  if (data.charCodeAt(position) === 58) {
    nextspace = data.indexOf(' ', position);

    // If there's nothing after the prefix, deem this message to be
    // malformed.
    if (nextspace === -1) {
      // Malformed IRC message.
      return null;
    }

    message.prefix = data.slice(position + 1, nextspace);
    position = nextspace + 1;

    // Skip any trailing whitespace.
    while (data.charCodeAt(position) === 32) {
      position++;
    }
  }

  nextspace = data.indexOf(' ', position);

  // If there's no more whitespace left, extract everything from the
  // current position to the end of the string as the command.
  if (nextspace === -1) {
    if (data.length > position) {
      message.command = data.slice(position);
      return message;
    }

    return null;
  }

  // Else, the command is the current position up to the next space. After
  // that, we expect some parameters.
  message.command = data.slice(position, nextspace);

  position = nextspace + 1;

  // Skip any trailing whitespace.
  while (data.charCodeAt(position) === 32) {
    position++;
  }

  while (position < data.length) {
    nextspace = data.indexOf(' ', position);

    // If the character is a colon, we've got a trailing parameter.
    // At this point, there are no extra params, so we push everything
    // from after the colon to the end of the string, to the params array
    // and break out of the loop.
    if (data.charCodeAt(position) === 58) {
      message.trailing = data.slice(position + 1);
      break;
    }

    // If we still have some whitespace...
    if (nextspace !== -1) {
      // Push whatever's between the current position and the next
      // space to the params array.
      message.params.push(data.slice(position, nextspace));
      position = nextspace + 1;

      // Skip any trailing whitespace and continue looping.
      while (data.charCodeAt(position) === 32) {
        position++;
      }
    } else if (nextspace === -1) {
      message.params.push(data.slice(position));
      break;
    }
  }
  return message;
}

export function createStream(options = {}) {
  const convertTimestamps = options.convertTimestamps || false;
  const shouldParsePrefix = options.parsePrefix || false;
  let buffer = '';

  const stream = through.obj(function transform(chunk, encoding, done) {
    buffer += chunk.toString();
    const messages = buffer.split(/\r\n/);
    buffer = messages.pop();

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const parsed = parse(message);

      if (parsed === null) {
        this.emit('error', new Error('Invalid IRC message'));
      } else {
        // support for IRCv3.2 server-time spec
        const timestamp = parsed.tags.time;

        if (timestamp && convertTimestamps) {
          const converted = iso8601.toDate(timestamp);
          parsed.tags.time = (converted) || new Date(NaN);
        }

        //
        if (shouldParsePrefix) {
          parsed.prefix = parsePrefix(parsed.prefix);
        }

        this.push(parsed);
      }
    }

    done();
  });

  return stream;
}
