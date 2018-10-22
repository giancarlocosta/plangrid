const root = '../..';
const express = require('express');
const router = new express.Router();
const crypto = require('crypto');
const fs = require('fs-promise');
const os = require('os');

const conf = require(`${root}/server/configs/config.js`);
const pkg = require(`${root}/package.json`);
const utils = require(`${root}/common/util.js`);


// Compute the hash of all loaded modules (do it once and cache for all /status reqs)
const modules = Object.keys(require.cache);
const sha256 = crypto.createHash('sha256');
for (const module of modules) {
  const content = fs.readFileSync(module);
  sha256.update(content);
}
const MODULE_HASH = sha256.digest('hex');


router.get('/', async (req, res, next) => {
  // Gather basic service info
  const name = pkg.name;
  const version = pkg.version;
  const build = process.env.BUILD_NUMBER;

  // Gather system-related statistics
  const system = {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    uptime: os.uptime(),
    cpus: os.cpus(),
    loadavg: os.loadavg(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    network: os.networkInterfaces(),
    user: os.userInfo(),
    fips: !!crypto.fips
  };

  // TODO: Check database connection health
  const database = 'connected';

  // Determine overall operational state
  const state = 'operational';

  // Assemble the final status report
  const status = { name, state, version, build, hash: MODULE_HASH, system, database };
  res.send(status);
});



module.exports = router;
