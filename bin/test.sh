#!/bin/bash
cd "$(dirname "$0")/.."

export SUPERTEST_APP=true
export LOG_LEVEL=ERROR
node_modules/.bin/_mocha -b test/**/*.js
