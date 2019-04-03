import _ from 'lodash';

class Cache {
  constructor() {
    this.cached = new Map();
  }

  set(key, value) {
    this.cached.set(key, {
      time: Date.now(),
      value
    });
    return this; // for chaining calls
  }

  clear(key) {
    this.cached.delete(key);
    return this; // for chaining calls
  }

  async recalculate(key, func) {
    const val = await func();
    this.set(key, val);
    return val;
  }

  /**
   * gets a cached value
   * @param {String} key Key to retrieve
   * @param {Object} options Options
   * @param {Function|Object} defaultOrRecalculate Recalculation function or value to return when the key is not found.
   * @param {Number} [options.maxAge=null] Cache expiry time. Set to falsy to disable expiration (default: null)
   * @param {Boolean} [options.lazyRevalidate=true] Allow lazy re-evaluation (default: true)
   */
  async get(key, defaultOrRecalculate, options) {
    const currentVal = this.cached.get(key);
    if (currentVal) {
      if (!options || !options.maxAge || currentVal.time + options.maxAge > Date.now()) {
        console.log('Returning cached');
        return currentVal.value;
      }
      if ((!options || options.lazyRevalidate !== false) && _.isFunction(defaultOrRecalculate)) {
        console.log('Returning cached, lazy reevaluating');
        this.recalculate(key, defaultOrRecalculate);
        return currentVal.value;
      }
    }
    console.log('Returning evaluated');
    return _.isFunction(defaultOrRecalculate) ? this.recalculate(key, defaultOrRecalculate) : options.default;
  }
}

export default new Cache();
