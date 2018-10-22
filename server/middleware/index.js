const fs = require('fs');
const path = require('path');

fs.readdirSync(__dirname).forEach((file) => {
  const filename = path.parse(file).name;
  if (filename !== 'index') {
    module.exports[filename] = require(`./${file}`); // eslint-disable-line global-require
  }
});
