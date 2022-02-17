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
  freeWorker.postMessage('run');
  freeWorkers.delete(freeWorker);
  occupiedWorkers.add(freeWorker);
}

function handleRequest({ delay, sum }) {
  if (replies.size === 0) {
    return null;
  }

  const [reply] = replies;
  replies.delete(reply);

  if (replies.size > 0) {
    runWorker();
  }

  return reply.code(200).send({
    delay,
    sum,
  });
}

for (let i = 0; i < CPUS_LENGTH; i += 1) {
  const worker = new Worker(`${process.cwd()}/queued-threads/worker.js`);
  worker.on(
    'message',
    (data) => {
      occupiedWorkers.delete(worker);
      freeWorkers.add(worker);
      handleRequest(data);
    },
  );
  freeWorkers.add(worker);
}

app.server.on(
  'connection',
  (connection) => {
    connection.on(
      'close',
      () => {
        // delete replies with closed connections
        replies.forEach((reply) => {
          if (reply.raw.connection === connection) {
            replies.delete(reply);
          }
        });

        if (replies.size > 0 && freeWorkers.size > 0) {
          runWorker();
        }
      },
    );
  },
);

app.get('/', (_, reply) => {
  replies.add(reply);
  if (freeWorkers.size > 0) {
    runWorker();
  }
});

app.listen(
  5001,
  (error) => {
    if (error) {
      throw error;
    }

    return logger('-- QUEUED-THREADS server is running on port 5001');
  },
);
