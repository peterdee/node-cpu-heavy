const console = require('console');
const fastify = require('fastify');

const task = require('./task');

const app = fastify();

app.get('/', (request, reply) => {
  const now = Date.now();
  const sum = task();

  const delay = Date.now() - now;
  console.log('Pre-reply:', delay, request.id);
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

    return console.log('-- SIMPLE server is running on port 5001');
  }
);
