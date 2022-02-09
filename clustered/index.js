const cluster = require('cluster');
const fastify = require('fastify');
const os = require('os');

const logger = require('../logger');
const task = require('../task');

const app = fastify();
const cpus = os.cpus().length;

let i = 0;

app.get('/', (_, reply) => {
  const { delay, sum } = task();

  i += 1;
  logger('Pre-reply:', delay, i);
  return reply.code(200).send({
    delay,
    sum,
  });
});

if (cluster.isPrimary) {
  for (let c = 0; c < cpus; c += 1) {
    cluster.fork();
  }
} else {
  app.listen(
    5001,
    (error) => {
      if (error) {
        throw error;
      }

      return logger('-- CLUSTERED server is running on port 5001');
    },
  );
}
