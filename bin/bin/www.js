const start = Date.now();

const chalk = require('chalk');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const app = require('../app');
const DEFAULT_PORT = '3000';
const port = normalizePort(process.env.PORT || DEFAULT_PORT);
const server = http.createServer(app);

console.clear();
console.log([
  chalk.yellow(`------------------------------------------------------`),
  '',
  `⏳ ${chalk.blue('Loading...')}`,
  '',
  `${chalk.yellow(`🚀`)} ${chalk.green('Starting server...')}`,
  ''
].join('\n'));

server
  .listen(port)
  .on('error', handleServerError)
  .on('listening', handleServerListening);

function normalizePort(val) {
  const parsedPort = parseInt(val, 10);
  return (isNaN(parsedPort)) ? val : (parsedPort >= 0) ? parsedPort : false;
}

function handleServerError(error) {
  if (error.syscall !== 'listen') throw error;

  const bind = `${typeof port === 'string' ? 'Pipe' : 'Port'} ${port}`;
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
  console.log([
    `🎈 ${chalk.green(`Loaded in ${end - start}ms`)}`,
    '',
    `🔥 Server is ${chalk.green('online')}!`,
    `🔗 ${chalk.underline(process.env.BASE_URL || `http://localhost:${port}`)}`,
    '',
    chalk.yellow(`------------------------------------------------------`),
    '',
    ''
  ].join('\n'));
}
