export function sleepStep(
  timeoutMilliseconds = 1000,
  stepMilliseconds = 50,
  callback: () => void
) {
  return new Promise<void>((resolve) => {
    doSleep(
      new Date(),
      timeoutMilliseconds,
      stepMilliseconds,
      callback,
      resolve
    );
  });
}

function doSleep(
  start: Date,
  timeout = 1000,
  stepMilliseconds = 50,
  callback: () => void,
  resolve: () => void
) {
  setTimeout(() => {
    callback();

    const elapsed = new Date().getTime() - start.getTime();

    if (timeout - elapsed < 0) {
      return resolve();
    }

    doSleep(start, timeout, stepMilliseconds, callback, resolve);
  }, stepMilliseconds);
}
