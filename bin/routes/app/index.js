const express = require('express');
const router = express.Router();
const embed = require('../../src/embed');

router
  .get('/', async (req, res, next) => {
    res.render('index', { title: 'Home', embed });
  });

module.exports = router;
