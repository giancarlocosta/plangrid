
const fs = require('fs');
const utils = require('../common/util.js');
const faker = require('json-schema-faker');


function mockSchema(schemaName) {
  const schema = utils.loadSchema(schemaName);
  const schemaMock = faker(schema);
  return schemaMock;
}

module.exports = {
  mockSchema
};

// console.log(JSON.stringify(mockSchema(process.argv[2])));
