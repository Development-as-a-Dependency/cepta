const express = require('express');
const router = express.Router();

var embed = require('../../src/embed');
var func = require('../../src/func');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home', embed: embed });
});

module.exports = router;
