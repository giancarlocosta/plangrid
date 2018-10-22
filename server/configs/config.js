/* *****************************************************************************
This module should be the first require-d module in the whole app. Don't require
or use any modules that might require ENV/config variables (e.g. service-logger
LOG_LEVEL) before loading config in this module!
*******************************************************************************/

const root = '../..';
const _ = require('lodash');
const fs = require('fs');
const crypto = require('crypto');
const convict = require('convict');
const pkg = require(`${root}/package.json`);


convict.addFormat({
  name: 'service-url',
  validate: (val) => {
    if (!/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~/#=]{2,256}$/.test(val)) {
      throw new Error('Must be a valid url.');
    }
  }
});


const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'production',
    env: 'NODE_ENV',
    arg: 'env'
  },
  host: {
    doc: 'The host address to bind.',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'SERVER_HOST',
    arg: 'host'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'SERVER_PORT',
    arg: 'port'
  },
  log_level: {
    doc: 'The minimum log level to allow.',
    format: String,
    default: 'INFO',
    env: 'LOG_LEVEL',
    arg: 'log_level'
  },
  log_path: {
    doc: 'Where to write logs in addition to console.',
    format: String,
    default: `/var/log/${pkg.name}.log`,
    env: 'LOG_PATH',
    arg: 'log_path'
  },
  storage_dir: {
    doc: 'Where to store files during life of service.',
    format: String,
    default: `/tmp/${pkg.name}`,
    env: 'STORAGE_DIR',
    arg: 'storage_dir'
  },
  coverage: {
    doc: 'Whether to add hooks for code coverage (use for testing).',
    format: 'Boolean',
    default: false,
    env: 'COVERAGE',
    arg: 'coverage'
  },
  config_dir: {
    doc: 'The location of JSON config files. These files will be alphabetically sorted ' +
         'in ascending order and then deep/recursively merged.',
    format: String,
    default: '/opt/service/config',
    env: 'CONFIG_DIR',
    arg: 'config_dir'
  },
  config_check_interval: {
    doc: 'The interval in milliseconds between config change checks.',
    format: 'int',
    default: 10000,
    env: 'CONFIG_CHECK_INTERVAL',
    arg: 'config_check_interval'
  },
  config_check_enabled: {
    doc: 'Whether to periodically (config_check_interval) check for config changes in config_dir.',
    format: 'Boolean',
    default: false,
    env: 'CONFIG_CHECK_ENABLED',
    arg: 'config_check_enabled'
  },
  query: {
    min_page_size: {
      doc: 'Minimum page size returned by queries.',
      format: 'int',
      default: 100,
      env: 'MIN_PAGE_SIZE',
      arg: 'query.min_page_size'
    },
    max_page_size: {
      doc: 'Maximum page size returned by queries.',
      format: 'int',
      default: 500,
      env: 'MAX_PAGE_SIZE',
      arg: 'query.max_page_size'
    },
    default_page_size: {
      doc: 'Default page size returned by queries.',
      format: 'int',
      default: 100,
      env: 'DEFAULT_PAGE_SIZE',
      arg: 'query.default_page_size'
    }
  }
});


function valueExists(value) {
  return value && value !== undefined && typeof value !== 'undefined' && value !== null && value !== 'null';
}

// Get all files in configDir with names like 'config*.json'
function getConfigFiles(configDir) {
  return _.sortBy(
    _.map(
      _.filter(
        fs.readdirSync(configDir),
        (f) => f.startsWith('config') && f.endsWith('.json')
      ),
      (f) => `${configDir}/${f}`
    ),
    p => p
  );
}

/**
* Caluclate hashes of all json config files in the 'configDir'
* @return {int|}
*   undefined: if problem finding config files or none found, then no has hcan be created
*   -1:        if current hash of files does not equal last hash
*   number:    calculated hash of found files
*/
let ENV_FILE_HASH;
function checkConfigFiles(configDir) {
  try {
    const configFiles = getConfigFiles(configDir);
    if (configFiles && configFiles.length > 0) {
      const sha256 = crypto.createHash('sha256');
      for (let i = 0; i < configFiles.length; i++) {
        try {
          sha256.update(fs.readFileSync(configFiles[i]));
        } catch (err) {
          console.log(err); // eslint-disable-line no-console
        }
      }
      const curHash = sha256.digest('hex');
      if (!ENV_FILE_HASH) {
        ENV_FILE_HASH = curHash;
      } else if (ENV_FILE_HASH !== curHash) {
        return -1;
      }
    }
  } catch (e) {
    if (['*', 'debug'].includes(config.get('log_level').toLowerCase())) {
      console.log(`${(new Date()).toISOString()} - debug - ` + // eslint-disable-line no-console
        `server/configs/config.js - Problem checking config files: ${e}`);
    }
  }
  return ENV_FILE_HASH;
}

/**
* Merge all json config files in the 'configDir' into one object
* @return {Object} - Object will be empty if no configs found
*/
function mergeConfigFiles(configDir) {
  const mergedConfig = {};
  try {
    const configFiles = getConfigFiles(configDir);
    if (configFiles && configFiles.length > 0) {
      for (let i = 0; i < configFiles.length; i++) {
        try {
          _.merge(mergedConfig, JSON.parse(fs.readFileSync(configFiles[i])));
        } catch (err) {
          console.log(err); // eslint-disable-line no-console
        }
      }
    }
  } catch (e) {
    console.log(`${(new Date()).toISOString()} - warning - ` + // eslint-disable-line no-console
      `server/configs/config.js - Problem merging config files: ${e}`);
  }
  return mergedConfig;
}


/* *****************************************************************************
INITIALIZE CONFIG
*******************************************************************************/

config.load(mergeConfigFiles(process.env.CONFIG_DIR || '/opt/service/config'));
config.validate({ allowed: 'silent' }); // Don't log warnings when unexpected config keys provided

// Naughty: safely add custom utility functions to the Convict's config object,
// for a cleaner interface for other modules throughout the project
config.customUtils = {
  checkConfigFiles,
  mergeConfigFiles
};

module.exports = config;
