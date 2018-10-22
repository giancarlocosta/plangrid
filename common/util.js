const _ = require('lodash');
const fs = require('fs');
const Logger = require('service-logger');

const logger = new Logger(__filename);

function createError(errorName, clientMessage) {
  const err = new Error(errorName);
  err.clientMessage = clientMessage;
  return err;
}

function throwError(errorName, clientMessage) {
  throw createError(errorName, clientMessage);
}

function rejectError(errorName, clientMessage) {
  return Promise.reject(createError(errorName, clientMessage));
}

// Cassandra ORM needs fields to be lowercase
function objToLower(origObj) {
  return _.transform(origObj, (result, val, key) => {
    result[key.toLowerCase()] = val; // eslint-disable-line no-param-reassign
  });
}

function exists(variable) {
  return variable && typeof variable !== 'undefined' && variable !== null && variable !== undefined;
}

function arrayContainsAnotherArray(needle, haystack) {
  for (let i = 0; i < needle.length; i++) {
    if (haystack.indexOf(needle[i]) === -1) {
      return false;
    }
  }
  return true;
}


// Instrument specified files and add a /coverage endpoint to tha app
// NOTE: this method should only be used when NODE_ENV !== production
function instrument(app) {
  logger.notice('Hooking istanbul loader for coverage');
  const im = require('istanbul-middleware'); // eslint-disable-line global-require
  im.hookLoader((file) => {
    const excludes = ['node_modules', 'cassandra.js', 'ModelController.js'];
    for (let i = 0; i < excludes.length; i++) {
      if (file.includes(excludes[i])) { return false; }
    }
    return true;
  });
  // im.hookLoader(__dirname);
  app.use('/coverage', im.createHandler());
}


function enableDevHooks(app) {
  logger.notice('Enabling /api-docs and /test endpoints');
  const DEFAULT_TEST_ROOT = '/test';
  const SWAGGER_SPEC = '../doc/swagger-api-specification.json';

  // Enable swagger UI
  const swaggerUi = require('express-swaggerize-ui'); // eslint-disable-line global-require
  app.use('/api-docs.json', (req, res) => { res.json(require(SWAGGER_SPEC)); }); // eslint-disable-line global-require
  app.use('/api-docs', swaggerUi());
}


module.exports = {
  createError,
  throwError,
  rejectError,
  objToLower,
  exists,
  arrayContainsAnotherArray,
  instrument,
  enableDevHooks
};
