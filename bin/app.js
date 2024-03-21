const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const embed = require('./src/embed');
const routeManager = require('./routes/router');
const logger = require('./src/logger');

require('dotenv').config();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  handler: (...p) => {
    // Call custom error handler
    p[2](createError(429, 'Too many requests, please try again later.'));
  },
});

const app = express();

app
  .set('view engine', 'pug')
  .use(logger)
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(helmet({ contentSecurityPolicy: false }))
  .use(express.static('public'))
  .use(limiter)
  .use(cors())
  .use(compression())
  .use((_, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  })
  .use('/', routeManager)
  .use((req, res, next) => {
    next(createError(404));
  })
  .use((err, req, res, next) => {
    const status = err.status || 500;
    const user = {
      ip: req.headers['cf-connecting-ip'] || req.connection.remoteAddress || req.ip || 'Unknown',
      rayid: req.headers['cf-ray'] || 'Unknown',
    };

    console.error(err);

    res.status(status).render('error', { title: status, embed, error: { status, message: err.message }, user });
  });

module.exports = app;
