const start = Date.now();

const chalk = require('chalk');
const dotenv = require('dotenv');
const http = require('http');
const debug = require('debug')('test:server');

dotenv.config();

const app = require('../app');
const DEFAULT_PORT = '3000';
const port = normalizePort(process.env.PORT || DEFAULT_PORT);
const server = http.createServer(app);

console.clear();
console.log(' ');
console.log(chalk.yellow(`------------------------------------------------------`));
console.log(' ');
console.log('⏳ ' + chalk.blue('Loading...'));

server.listen(port);
server.on('error', handleServerError);
server.on('listening', handleServerListening);

function normalizePort(val) {
  const parsedPort = parseInt(val, 10);

  if (isNaN(parsedPort)) return val; // Named pipe
  if (parsedPort >= 0) return parsedPort; // Port number

  return false;
}

function handleServerError(error) {
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  const errorMessages = {
    EACCES: `🔥 ${bind} requires elevated privileges`,
    EADDRINUSE: `🔥 ${bind} is already being used`,
    ECONNREFUSED: `🔥 ${bind} refused the connection`,
    ECONNRESET: `🔥 ${bind} reset the connection`,
    ENOTFOUND: `🔥 ${bind} could not be found`,
    ENETUNREACH: `🔥 ${bind} is unreachable`,
  };

  const errorMessage = errorMessages[error.code] || error.message;

  console.error(chalk.red(errorMessage));
  process.exit(1);
}

function handleServerListening() {
  const end = Date.now();
  console.log('🎈 ' + chalk.green('Loaded in ' + (end - start) + 'ms'));
  console.log(' ');
  console.info(`🔥 Server is ${chalk.green('online')}!`);
  console.info(`🔗 ${chalk.underline(process.env.BASE_URL || 'http://localhost:' + port)}`);
  console.info(' ');
  console.log(chalk.yellow(`------------------------------------------------------`));
  console.log(' ');
}
