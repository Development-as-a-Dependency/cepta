const express = require('express');
const router = express.Router();
const appRouter = require('./app/index');

router
    .use('/', appRouter);

module.exports = router;
