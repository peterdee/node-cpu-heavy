const cluster = require('cluster');
const fastify = require('fastify');
const os = require('os');

const logger = require('../logger');
const task = require('../task');

const app = fastify();
const cpus = os.cpus().length;

app.get('/', (_, reply) => {
  const { delay, sum } = task();
  return reply.code(200).send({
    delay,
    sum,
  });
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

      return logger('-- CLUSTERED server is running on port 5001');
    },
  );
}
