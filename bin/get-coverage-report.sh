#!/bin/bash -e

cd "$(dirname "$0")/.."

API_URL=${1:-"http://0.0.0.0:3000"}

echo "Downloading and unzipping coverage report"
curl -o coverage.zip "$API_URL/coverage/download"
mkdir -p coverage
unzip -q -o coverage.zip -d coverage
rm -rf coverage.zip
./node_modules/.bin/lcov-summary coverage/lcov.info
