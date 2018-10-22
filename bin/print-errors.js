const errorConfig = require(`${__dirname}/../server/configs/errors.json`);
const errorNames = Object.keys(errorConfig);
process.stdout.write(`\n\n# **ERRORS**\n\n`);

for (let i = 0; i < errorNames.length; i++) {
  const errorName = errorNames[i];
  const error = errorConfig[errorName];
  process.stdout.write(`\n##### ${errorName}\n\n`);
  process.stdout.write('\n```\n\n');
  process.stdout.write(`${JSON.stringify(error, null, 3)}\n`);
  process.stdout.write('\n```\n\n');
}
