const task = require('../task');

function work() {
  const result = task();
  process.send(result);

  return process.exit(0);
}

work();
