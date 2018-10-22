const root = '../..';
const express = require('express');
const middleware = require(`${root}/server/middleware`);
const hpp = require('hpp');

const router = new express.Router();

// Allow array values for these params
router.use(hpp(
  {
    whitelist: [
    ]
  }
));

// Add middleware specific to this route if necessary
router.use(middleware.util.parseQueryParams);

const excludedPaths = [
  '/api/status'
];

// Response formatting
router.use(middleware.util.getResponseFormatter(excludedPaths));

// Maps /api/{filename or foldername} to Router exported by that file or the
// index.js file in that {foldername}
middleware.util.mapRoutes(router, __dirname);


module.exports = router;
