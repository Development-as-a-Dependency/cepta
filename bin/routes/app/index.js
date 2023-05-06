const express = require('express');
const router = express.Router();

const embed = require('../../src/embed');
const func = require('../../src/func');

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index', { title: 'Home', embed: embed });
});

module.exports = router;
