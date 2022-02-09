const fastify = require('fastify');

const logger = require('../logger');
const task = require('../task');

const app = fastify({
  logger: true,
});

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

app.listen(
  5001,
  (error) => {
    if (error) {
      throw error;
    }

    return logger('-- SIMPLE server is running on port 5001');
  },
);
