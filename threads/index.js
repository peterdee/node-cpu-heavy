const fastify = require('fastify');
const { Worker } = require('worker_threads');

const logger = require('../logger');

const app = fastify();

let i = 0;

app.get('/', async (_, reply) => {
  const { delay, sum } = await new Promise((resolve) => {
    const worker = new Worker(`${process.cwd()}/threads/worker.js`);
    worker.on('message', resolve);
  });
  i += 1;
  logger('Pre-reply:', delay, i);
  return reply.code(200).send({
    delay,
    sum,
  });
});

app.listen(
  5001,
  (error) => {
    if (error) {
      throw error;
    }

    return logger('-- THREADS server is running on port 5001');
  },
);
