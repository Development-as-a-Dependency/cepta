const morgan = require('morgan');
const chalk = require('chalk');

// Define custom Morgan format function with emojis
const customMorganFormat = (tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);

  let emoji = '✨';

  if (status >= 500) {
    emoji = '💥';
  } else if (status >= 400) {
    emoji = '🔥';
  } else if (status >= 300) {
    emoji = '🧬';
  } else if (status >= 200) {
    switch (method) {
      case 'GET':
        emoji = '🎉';
        break;
      case 'POST':
        emoji = '🚀';
        break;
      case 'PUT':
        emoji = '🌈';
        break;
      case 'DELETE':
        emoji = '🗑️';
        break;
      default:
        emoji = '✨';
        break;
    }
  }

  const styledMethod = methodColor(method);
  const styledStatus = statusColor(status);
  const styleTime = responseTimeColor(responseTime);
  const styledUrl = chalk.green(url);

  return `${emoji} ${styledMethod} ${styledUrl} - ${styledStatus} ${styleTime}`;
};

function methodColor(method) {
  switch (method) {
    case 'GET':
      return chalk.blue.bold(method);
    case 'POST':
      return chalk.green.bold(method);
    case 'PUT':
      return chalk.yellow.bold(method);
    case 'DELETE':
      return chalk.red.bold(method);
    default:
      return chalk.white.bold(method);
  }
}

function statusColor(status) {
  if (status >= 500) {
    return chalk.red.inverse(status);
  } else if (status >= 400) {
    return chalk.yellow(status);
  } else if (status >= 300) {
    return chalk.cyan(status);
  } else if (status >= 200) {
    return chalk.green(status);
  } else {
    return chalk.white(status);
  }
}

function responseTimeColor(responseTime) {
  if (responseTime >= 500) {
    return chalk.red(responseTime + 'ms');
  } else if (responseTime >= 100) {
    return chalk.yellow(responseTime + 'ms');
  } else if (responseTime >= 50) {
    return chalk.cyan(responseTime + 'ms');
  } else {
    return chalk.green(responseTime + 'ms');
  }
}

// Create the Morgan middleware with the custom format
const customMorganMiddleware = morgan(customMorganFormat);

module.exports = customMorganMiddleware;
