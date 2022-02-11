const fastify = require('fastify');
const os = require('os');
const { Worker } = require('worker_threads');

const logger = require('../logger');

const CPUS_LENGTH = os.cpus().length;

const app = fastify();
const freeWorkers = new Set();
const occupiedWorkers = new Set();
const replies = new Set();

function runWorker() {
  const [freeWorker] = freeWorkers;
  logger('worker', freeWorker.threadId, 'ready to run');
  freeWorker.postMessage('run');
  freeWorkers.delete(freeWorker);
  occupiedWorkers.add(freeWorker);
}

let cc = 0;
async function handleRequest({ delay, sum }) {
  if (replies.size === 0) {
    return null;
  }

  const [reply] = replies;
  replies.delete(reply);

  logger('send reply', replies.size, occupiedWorkers.size, freeWorkers.size);
  if (replies.size > 0) {
    logger('>>>>>>>>>>>>>>');
    runWorker();
  }

  return reply.code(200).send({
    delay,
    sum,
  });
}

for (let i = 0; i < CPUS_LENGTH / 2; i += 1) {
  const worker = new Worker(`${process.cwd()}/queued-threads/worker.js`);
  worker.on('message', (data) => {
    occupiedWorkers.delete(worker);
    freeWorkers.add(worker);
    logger('worker', worker.threadId, 'got message', data, occupiedWorkers.size, freeWorkers.size);
    handleRequest(data);
  });
  freeWorkers.add(worker);
}

app.server.on(
  'connection',
  (connection) => {
    cc += 1;
    logger('connection opened', cc);
    connection.on(
      'close',
      () => {
        logger('close connection', replies.size, cc);
        if (replies.size > 0 && freeWorkers.size > 0) {
          logger('run worker from close connection', freeWorkers.size, occupiedWorkers.size);
          runWorker();
        }
      },
    );
  },
);

app.get('/', (_, reply) => {
  replies.add(reply);
  if (freeWorkers.size > 0) {
    logger('run worker from controller');
    runWorker();
  } else {
    logger('queued');
  }
});

app.listen(
  5001,
  (error) => {
    if (error) {
      throw error;
    }

    return logger('-- QUEUE server is running on port 5001');
  },
);
