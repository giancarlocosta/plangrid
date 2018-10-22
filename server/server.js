/* *****************************************************************************
* ENVIRONMENT VARIABLES
*******************************************************************************/

const conf = require('./configs/config.js');

/* *****************************************************************************
* EXPRESS SERVER APP
*******************************************************************************/

const root = '..';
const express = require('express');
require('express-async-errors');

const Promise = require('bluebird');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const hpp = require('hpp');
const fs = require('fs');
const morgan = require('morgan');
const prom = require('express-prom-bundle');
const requestId = require('express-request-id');
const requestContext = require('request-context');
const Logger = require('service-logger');
const pkg = require(`${root}/package.json`);
const utils = require('../common/util.js');

const logger = new Logger(__filename);

const app = express();

// Default server parameters
const SERVER_HOST = conf.get('host');
const SERVER_PORT = conf.get('port');
// const DEFAULT_ROOT = '/api'; // This is preferred, but changing for coding challenge
const DEFAULT_ROOT = '/api';

// Before your code is require()-ed, hook the loader for coverage
if (conf.get('coverage')) { utils.instrument(app); }

// const routes = require('./routes/api'); // This is preferred, but changing for coding challenge
const routes = require('./routes');
const middleware = require('./middleware');

// Set service log level that all instances of logger should use
logger.logLevel = conf.get('log_level');

// Enable middleware for automatically parsing JSON
app.use(bodyParser.json({ limit: '100mb' }));

// Wrap every request in a 'request' namespace/context that can hold context vars
// for other functions to access
app.use(requestContext.middleware('request'));

// Automagically create a metrics endpoint for use by Prometheus
app.use(prom({ includeStatusCode: true, includeMethod: true, includePath: true }));

// Add a unique ID to each request if one not provided by the requestor
app.use(requestId());

// Make two log entries for each request, one before process and one after
//app.use(morgan(':date[iso] - notice: :remote-addr ":method :url" :req[X-Request-Id]', { immediate: true }));
//app.use(morgan(':date[iso] - notice: :remote-addr ":method :url" :status :res[content-length] :res[X-Request-Id]'));

// These two middlewares provide numerous security enhancements
app.use(helmet());
app.use(hpp());

// Add request id and other vars to the request context for routes to use
app.use(middleware.util.setRequestContext);

// Disable caching on all routes by default. Explicitly overwrite Cache-Control
// header in each route/route middleware that you do want client caching
app.use(middleware.util.disableCaching);

// Log URL of each request at debug level
app.use(middleware.util.logUrl);

// Configure routes
app.use(DEFAULT_ROOT, routes);

// Dev environments only
if (conf.get('env') !== 'production') { utils.enableDevHooks(app); }

// Error handling middleware for known and unknown errors
app.use(middleware.error.errorHandler);
process.on('uncaughtException', middleware.error.uncaughtExceptionHandler);

// If the service writes any local files, restrict their permissions
process.umask(0o0077);


/* *****************************************************************************
* METRIC SERVICE API SERVER
******************************************************************************/

async function startup() {
  try {
    // Do pre-server-start initialization
    // logger.notice('Connecting to DB...');
    // await db.connect();
    // logger.notice('Connected to DB.');

    // Start the server
    const server = app.listen(SERVER_PORT, SERVER_HOST, () => {
      // This pid file is used by killservice.sh during testing. See package.json
      fs.appendFileSync('/tmp/plangrid-service-process-pids', `${process.pid}\n`);
      logger.notice(`plangrid-service PID: ${process.pid}`);
      logger.notice(`Server at ${SERVER_HOST}:${SERVER_PORT}${DEFAULT_ROOT}`);
      logger.notice(`Server Configuration: ${conf.toString().replace(/ |\n/g, '')}`);

      // Gracefully shutdown the server and die if config files change.
      function gracefulShutdown() {
        logger.warn('Configs have changed. Closing server and handling remaining connections.');
        server.close((err) => {
          if (err) {
            logger.error(err);
          }
          logger.warn('All server connections closed. Committing suicide to reload new configs.');
          process.exit(1);
        });
      }
      if (conf.get('config_check_enabled')) {
        const configCheck = setInterval(() => {
          if (conf.customUtils.checkConfigFiles(conf.get('config_dir')) === -1) {
            gracefulShutdown();
            clearInterval(configCheck);
          }
        }, conf.get('config_check_interval'));
      }
      server.setTimeout(0);
    });

  } catch (startupErr) {
    middleware.error.uncaughtExceptionHandler(startupErr);
  }
}

startup();

module.exports = app;
