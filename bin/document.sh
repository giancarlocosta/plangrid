#!/bin/bash -e

cd "$(dirname "$0")/.."

rm -rf docs

export CONFIG_DIR=.

node_modules/swagger2md/bin/index.js -i doc/swagger-api-specification.json -o doc/api.md;
node bin/print-errors.js >> doc/api.md
node bin/print-configuration-schema.js > doc/configuration.md
