const console = require('console');
const fastify = require('fastify');
const { fork } = require('child_process');

const app = fastify();

app.get('/', (request, reply) => {
  const now = Date.now();

  const child = fork(`${process.cwd()}/child-process-worker.js`);
  child.on('message', (sum) => {
    const delay = Date.now() - now;
    console.log('Pre-reply:', delay, request.id);
    return reply.code(200).send({
      delay,
      sum,
    });
  });
});

app.listen(
  5001,
  (error) => {
    if (error) {
      throw error;
    }

    return console.log('-- CHILD-PROCESS server is running on port 5001');
  }
);
