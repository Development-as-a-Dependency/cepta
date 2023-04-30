const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const routeManager = require('./routes/router');

const app = express();

app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('trust proxy', true);
app.all('*', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

// Route Manager
app.use('/', routeManager);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  const embed = require('./src/embed');
  const error = {
    status: err.status || 500,
    message: err.message,
  };
  const user = {
    ip:
      req.headers['x-forwarded-for'] ||
      req.headers['cf-connecting-ip'] ||
      req.connection.remoteAddress ||
      req.ip ||
      'Unknown',
    rayid: req.headers['cf-ray'] || 'Unknown',
  };
  res.render('error', { title: err.status || 500, embed: embed, error: error, user: user });
});

module.exports = app;
