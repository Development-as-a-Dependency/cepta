const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const embed = require('./src/embed');
const routeManager = require('./routes/router');

require('dotenv').config();

const app = express();

// App settings
app.set('view engine', 'pug');

// Middleware configurations
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static('public'));

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  handler: (req, res, next) => {
    // Call custom error handler
    next(createError(429, 'Too many requests, please try again later.'));
  },
});
app.use(limiter);

app.use(cors());
app.use(compression());

// Disable caching for all routes
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// Routes
app.use('/', routeManager);

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// General error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const user = {
    ip: req.headers['cf-connecting-ip'] || req.connection.remoteAddress || req.ip || 'Unknown',
    rayid: req.headers['cf-ray'] || 'Unknown',
  };

  console.error(err);

  res.status(status).render('error', { title: status, embed, error: { status, message: err.message }, user });
});

module.exports = app;
