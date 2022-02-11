const { parentPort } = require('worker_threads');

const task = require('../task');

parentPort.on(
  'message',
  (message) => {
    if (message !== 'run') {
      return null;
    }
    return parentPort.postMessage(task());
  },
);
