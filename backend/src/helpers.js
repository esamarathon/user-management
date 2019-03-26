import _ from 'lodash';
import fetch from 'node-fetch';
import { models } from './models';

export function throttleAsync(func, duration) {
  let lastInitiated = 0;
  let promise = null;
  let finishedPromise = null;

  return (fast, ...args) => {
    const now = Date.now();
    if (now - lastInitiated > duration) {
      console.log('Initiating throttled call');
      const newPromise = func(...args);
      promise = newPromise;
      lastInitiated = now;
      if (newPromise.then) {
        newPromise.then(() => {
          finishedPromise = newPromise;
        });
      }
    }
    if (fast && finishedPromise) return finishedPromise;
    return promise;
  };
}

export function notify(user, data) {
  const activity = new models.Activity(_.merge({}, { user: user._id || user }, data));
  activity.save();
  // TODO: emit activity to rabbit
}

export function httpReq(url, params) {
  return fetch(url, params).then(res => res.json());
}

export function httpPost(url, params) {
  const p = _.merge({ method: 'POST' }, params);
  if (p.body) {
    if (p.headers && p.headers['Content-Type'] === 'application/json') {
      p.body = JSON.stringify(p.body);
    } else {
      p.body = new URLSearchParams();
      _.each(params.body, (val, key) => {
        p.body.append(key, val);
      });
    }
  }
  console.log('HTTP POST params:', p, p.body.toString());
  return httpReq(url, p);
}
