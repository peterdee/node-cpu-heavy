const fastify = require('fastify');

const logger = require('../logger');
const task = require('../task');

const app = fastify();

app.get('/', (_, reply) => {
  const { delay, sum } = task();
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
