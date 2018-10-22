const root = '../..';
const conf = require(`${root}/server/configs/config.js`);
const errorConfig = require(`${root}/server/configs/errors.json`);
const Logger = require('service-logger');

const logger = new Logger(__filename);

/**
* Returns copy of config error that you can modify without changing the
* original error imported from error-config.js
* @param {string} errorName - The title of the book.
* @returns {Object} Copy of error object from error-config.js
* @returns {undefined} No matching entry in error-config.js
*/
function getConfigError(errorName) {
  let err = {};
  const configError = errorConfig[errorName];

  if (configError) {
    err = Object.assign(err, configError);
  } else {
    err = undefined;
  }
  return err;
}

/**
* Generic Express middleware function to handle application errors.
* If the Error's message equals the name of an error defined in error-config.json
* that error object with predefined codes will be thrown! :)
*/
function errorHandler(err, req, res, next) {

  try {

    // Custom error handling here
    const configError = getConfigError(err.message);
    if (configError) {

      // Very important: on errors, request-context loses the req id for some
      // reason so add it here as logger metadata
      logger.notice(err, { requestId: req.id });
      logger.notice(err.clientMessage, { requestId: req.id });

      res.status(configError.statusCode);

      // Allow custom message to be set
      if (err.clientMessage) {
        configError.details = err.clientMessage;
      }

      // If env is debug, send full error with stack to client
      if (conf.get('env') === 'debug' || conf.get('env') === 'development') {
        const obj = {};
        const props = Object.getOwnPropertyNames(err);
        for (let i = 0; i < props.length; i++) {
          if (props[i] !== 'name') {
            obj[props[i]] = err[props[i]];
          }
        }
        configError.debug = obj;
      } else {
        // Prevent leakage of sensitive info in non dev/debug env
        delete configError.message;
        delete configError.details;
      }

      res.json(configError);

    } else { // Default 500 error if error not defined in error-config
      logger.error(err, { requestId: req.id });
      res.status(500).send('Internal Server Error');
    }

  } catch (e) {
    logger.error(e, { requestId: req.id });
    res.status(500).send('Internal Server Error');
  }

  return res;

}

/**
* Function to handle uncaught exceptions synchronously and always exit the
* process
*/
/* istanbul ignore next */
function uncaughtExceptionHandler(err) {

  logger.error(err);

  if (conf.get('env') === 'production') {
    // Send alert email, write to logs, etc.
  }
  process.exit(1);

}

module.exports = {
  errorHandler,
  uncaughtExceptionHandler
};
