/* eslint-disable max-len */
/* eslint-disable global-require */
const root = '..';
const request = require('request-promise');
const utils = require(`${root}/common/util.js`);
const API_URL = process.env.API_URL || 'http://0.0.0.0:3000';

/*
* Promise to stall before executing subsequent code (used in tests to wait
* a moment to ensure you can 'read your writes')
*/
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve(); }, ms);
  });
}

module.exports = {
  wait,
};
