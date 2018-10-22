const root = '../..';
const express = require('express');
const middleware = require(`${root}/server/middleware`).util;
const Logger = require('service-logger');
const logger = new Logger(__filename);
const router = new express.Router();

const HTML_RESPONSE = '<p>Hello, World</p>';
const JSON_RESPONSE = { message: 'Good morning' };

router.get('/', async (req, res, next) => {
  const acceptHeader = req.get('accept');
  if (!acceptHeader) {
    res.type('html').send(HTML_RESPONSE);
  } else if (acceptHeader === 'application/json') {
    res.send(JSON_RESPONSE);
  } else {
    res.type('html').send(HTML_RESPONSE);
  }
});


router.post('/', async (req, res, next) => {
  res.status(201).send();
});


module.exports = router;
