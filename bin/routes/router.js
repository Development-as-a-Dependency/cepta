console.log(require('chalk').green(require('../settings.json').settings.prefix + ' Router Loading...'));

const express = require('express');
const router = express.Router();

const appRouter = require('./app/index');

router.use('/', appRouter);

module.exports = router;

console.log(require('chalk').green(require('../settings.json').settings.prefix + ' Router Loaded.'));
