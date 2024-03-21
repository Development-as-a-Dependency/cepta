const morgan = require('morgan');
const chalk = require('chalk');

// Create the Morgan middleware with the custom format
module.exports = morgan((tokens, req, res) => {
  const m = tokens.method(req, res);
  const u = tokens.url(req, res);
  const s = tokens.status(req, res);
  const rt = tokens['response-time'](req, res);

  const emoji = (s >= 500) ? '💥'
    : (s >= 400) ? '🔥'
    : (s >= 300) ? '🧬'
    : (s >= 200) ?
      (m === 'GET') ? '🎉'
      : (m === 'POST') ? '🚀'
      : (m === 'PUT') ? '🌈'
      : (m === 'DELETE') ? '🗑️'
      : '✨'
    : '✨';

  const styledMethod = chalk.bold[
    (m === 'GET') ? 'blue'
    : (m === 'POST') ? 'green'
    : (m === 'PUT') ? 'yellow'
    : (m === 'DELETE') ? 'red'
    : 'white'
  ](m);
  
  const styledStatus = chalk[
    s >= 500 ? 'red'
    : s >= 400 ? 'yellow'
    : s >= 300 ? 'cyan'
    : s >= 200 ? 'green'
    : 'white'
  ](s);
  const styleTime = chalk[
    rt >= 500 ? 'red'
    : rt >= 100 ? 'yellow'
    : rt >= 50 ? 'cyan'
    : 'green'
  ](`${rt}ms`);
  const styledUrl = chalk.green(u);

  return `${emoji} ${styledMethod} ${styledUrl} - ${styledStatus} ${styleTime}`;
});
