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
