/* eslint-disable max-len */
/* eslint-disable no-console */
const conf = require(`${__dirname}/../server/configs/config.js`);
const schema = conf.getSchema();

function printProps(obj, opts = { propName: '', parentName: '' }) {
  if (obj.properties) {
    const keys = Object.keys(obj.properties);
    for (let i = 0; i < keys.length; i++) {
      const parent = (opts.parentName ? `${opts.parentName}.` : '') +
                    (obj.properties[keys[i]].properties ? `${keys[i]}` : '');
      printProps(obj.properties[keys[i]], { propName: keys[i], parentName: parent });
    }
  } else {
    process.stdout.write(`\n|${opts.parentName}${opts.propName}|${obj.doc}|${obj.default}|${obj.env}|${obj.arg}|`);
  }
}


console.log('# Server Configuration Options');
console.log(
  '> Configure the server through config files, ENV vars, and/or commandline args. See [node-convict](https://github.com/mozilla/node-convict) for Precendence order info, etc.<br/>' +
  'This doc contains the [Configuration Schema](#configuration-schema) and a beautified version of that schema in table format, [Configuration Table](#configuration-table).\n\n'
);

console.log('## Configuration Table');
process.stdout.write('\n|Name|Description|Default|Env Variable|Command Line Arg|');
process.stdout.write('\n|----|----|----|----|----|');
printProps(schema);
process.stdout.write('\n\n');

console.log('<br/><br/>');
console.log('## Configuration Schema');
console.log('> The schema version of the configuration table above.<br/>NOTE: ignore the `properties` fields!\n');
process.stdout.write('\n\n```\n\n');

console.log(`${JSON.stringify(conf.getSchema(), null, 3)}\n`);
process.stdout.write('\n```\n');
