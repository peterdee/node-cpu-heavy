const fastify = require('fastify');
const { fork } = require('child_process');

const logger = require('../logger');

const app = fastify();

app.get('/', (_, reply) => {
  const child = fork(`${process.cwd()}/child-process/worker.js`);
  child.on('message', ({ delay, sum }) => reply.code(200).send({
    delay,
    sum,
  }));
});

app.listen(
  5001,
  (error) => {
    if (error) {
      throw error;
    }

    return logger('-- CHILD-PROCESS server is running on port 5001');
  },
);
