const cluster = require('cluster');
const fastify = require('fastify');
const os = require('os');
const { Worker } = require('worker_threads');

const logger = require('../logger');

const app = fastify();
const cpus = os.cpus().length;

app.get('/', (_, reply) => {
  const worker = new Worker(`${process.cwd()}/clustered-threads/worker.js`);
  worker.on('message', ({ delay, sum }) => reply.code(200).send({
    delay,
    sum,
  }));
});

if (cluster.isPrimary) {
  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }
} else {
  app.listen(
    5001,
    (error) => {
      if (error) {
        throw error;
      }

      return logger('-- CLUSTERED-THREADS server is running on port 5001');
    },
  );
}
