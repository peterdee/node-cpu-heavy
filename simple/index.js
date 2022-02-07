const fastify = require('fastify');

const logger = require('../logger');
const task = require('../task');

const app = fastify();

app.get('/', (request, reply) => {
  const now = Date.now();
  const sum = task();

  const delay = Date.now() - now;
  logger('Pre-reply:', delay, request.id);
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
