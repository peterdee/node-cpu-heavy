const { Console } = require('console');

const logger = new Console(process.stdout, process.stderr);

module.exports = logger.log;
