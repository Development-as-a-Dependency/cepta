import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import embed from './src/embed';
import routeManager from './routes/router';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import chalk from 'chalk';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  handler: (req, res, next) => {
    next(createError(429, 'Too many requests, please try again later.'));
  },
});

dotenv.config();

const app = express();

app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.static('public'));
app.use(limiter);
app.use(cors());
app.use(compression());

app.all('*', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use('/', routeManager);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const error = {
    status: err.status || 500,
    message: err.message,
  };

  const user = {
    ip: req.headers['cf-connecting-ip'] || req.connection.remoteAddress || req.ip || 'Unknown',
    rayid: req.headers['cf-ray'] || 'Unknown',
  };

  console.error(err);

  res.status(err.status || 500).render('error', {
    title: err.status || 500,
    embed: embed,
    error: error,
    user: user,
  });
});

export default app;

console.log(chalk.green(require('./settings.json').settings.prefix + ' App Loaded.'));
