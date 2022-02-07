const task = require('./task');

function work() {
  const sum = task();
  process.send(sum);
  
  return process.exit(0);
}

work();
