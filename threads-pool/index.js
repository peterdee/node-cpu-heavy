const fastify = require('fastify');
const { Worker } = require('worker_threads');

const logger = require('../logger');

const app = fastify();

class Pool {
  static size = 100;

  constructor() {
    this.requests = [];
    this.workers = [];
  }

  addRequest(request, reply) {
    logger('add req', request.id);
    this.requests.push({
      id: request.id,
      reply,
      request,
    });
  }

  addWorker(threadId) {
    logger('add worker', threadId);
    this.workers.push(threadId);
  }

  popRequest(requestId) {
    const [request] = this.requests.filter(({ id }) => id === requestId);
    this.requests = this.requests.filter(({ id }) => id !== requestId);
    return request;
  }

  removeWorker(threadId) {
    logger('remove worker', threadId);
    this.workers = this.workers.filter((item) => item !== threadId);
  }
}

const pool = new Pool();

app.get('/', async (request, reply) => {
  const now = Date.now();

  pool.addRequest(request, reply);

  if (pool.workers.length < Pool.size) {
    const worker = new Worker(`${process.cwd()}/threads/worker.js`);
    pool.addWorker(worker.threadId);
    const sum = await new Promise((resolve) => {
      worker.on('message', resolve);
    });
    pool.removeWorker(worker.threadId);
    const delay = Date.now() - now;
    logger('Pre-reply:', delay, request.id);
    return reply.code(200).send({
      delay,
      sum,
    });
  }
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
