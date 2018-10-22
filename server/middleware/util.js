const root = '../..';
const fs = require('fs');
const path = require('path');
const mung = require('express-mung');
const requestContext = require('request-context');
const Logger = require('service-logger');
const conf = require(`${root}/server/configs/config.js`);

const logger = new Logger(__filename);

const MIN_PAGE_SIZE = conf.get('query.min_page_size');
const MAX_PAGE_SIZE = conf.get('query.max_page_size');
const DEFAULT_PAGE_SIZE = conf.get('query.default_page_size');

/**
* Map routes from the passed Router to any routes exposed by a file or
* directory in the passed dirname.
* @param {Object} router - Express router to map routes from
* @param {string} dirname - Any router in this dir will be mapped to the passed
*   router
*/
function mapRoutes(router, dirname) {
  fs.readdirSync(dirname).forEach((file) => {
    const filename = path.parse(file).name;
    const filepath = `${dirname}/${file}`;
    const fileIsDir = fs.lstatSync(filepath).isDirectory();
    const route = require(filepath); // eslint-disable-line global-require

    // Only map routes if the file/dir exposes/exports an express Router
    // Check if Router by checking if file has use() function
    if (route.use) {
      if (filename !== 'index') {
        router.use(`/${filename}`, route);
      }
    }
  });
}


/**
* Disable client caching of response
*/
function disableCaching(req, res, next) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
}

/**
* URL logger
*/
function logUrl(req, res, next) {
  logger.debug(`${req.method} ${req.url}`);
  next();
}

/**
* Add vars to context of this request
*/
function setRequestContext(req, res, next) {

  // NOTE: Event Logger will use these context variables!
  requestContext.set('request:requestId', req.id);

  next();
}


/**
* Parse query params of an Express Request object and modify it to contain
* info needed by routes
*/
function parseQueryParams(req, res, next) {

  // Filter options
  req.query.expanded = req.query.expanded === 'true';

  // Pagination
  const page = parseInt(req.query.page, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE;
  req.query.limit = limit >= MIN_PAGE_SIZE && limit <= MAX_PAGE_SIZE ? limit : DEFAULT_PAGE_SIZE;
  req.query.page = page > -1 ? page : 0;

  next();
}


/**
* Send uniform response format
*/
function getResponseFormatter(excludedPaths = []) {
  return mung.json((body, req, res) => {
    if (res.statusCode === 404) {
      return `Invalid URL: ${req.originalUrl}`;
    } else if (res.statusCode >= 400 || excludedPaths.includes(req.originalUrl)) {
      return body;
    }

    const rawData = body;
    const metaData = body ? body._meta : undefined;

    const formatted = rawData;

    // Don't standardize format for now
    // const formatted = {
    //   data: rawData || {}
    // };
    //
    // if (req.method === 'GET') {
    //
    //   // Pagination
    //   if (Array.isArray(formatted.data)) {
    //     formatted.pages = {
    //       index: req.query.page,
    //       total: 1,
    //       items: formatted.data.length >= 0 ? formatted.data.length : 1
    //     };
    //
    //     if (metaData) {
    //       if (metaData.totalItems && formatted.pages.items > 0) {
    //         formatted.pages.total = Math.ceil(metaData.totalItems / req.query.limit);
    //         formatted.pages.index = formatted.pages.index > formatted.pages.total ?
    //           formatted.pages.total : formatted.pages.index;
    //       }
    //       delete rawData._meta;
    //     }
    //   }
    // }

    return formatted;
  });
}


module.exports = {
  mapRoutes,
  parseQueryParams,
  getResponseFormatter,
  setRequestContext,
  disableCaching,
  logUrl
};
