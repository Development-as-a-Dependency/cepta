const express = require('express');
const router = express.Router();

var discordEmbed = {
  title: 'App',
  description: 'This is an app.',
  url: 'http://localhost:3000',
  theme: 0x5865f2,
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'App', discordEmbed: discordEmbed });
});

module.exports = router;
