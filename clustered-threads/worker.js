const { parentPort } = require('worker_threads');

const task = require('../task');

parentPort.postMessage(task());
