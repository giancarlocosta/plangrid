#!/bin/bash

cd "$(dirname "$0")/.."

# The name of the host to test is given as a parameter
export SERVICE_HOST=${1-"0.0.0.0"}
export DB_BASENAME="db_name_here"

# Install dependencies
echo "Installing test dependencies"
node -v | grep v[89] || { echo "Node Version must be >= 8"; exit 1; }
which unzip || apt-get install -y unzip || exit 1
npm install || exit 1

# # Lint code
# bin/lint.sh || exit 1
#
# # Audit dependencies
# bin/audit.sh || exit 1
#
# Source env vars for other bin and test scripts
. env/test.env

# Overwrite some sourced env vars so test scripts work
echo "Starting server"
export API_URL="http://0.0.0.0:3000"
export DB_HOSTS=$SERVICE_HOST
export BLUEBIRD_WARNINGS=0
export CONFIG_DIR=.
bin/killservice.sh
SERVER_LOG=/tmp/plangrid-service-test.log
node server/server.js > $SERVER_LOG 2>&1 &
#for i in $(seq 1 15); do echo -ne "Waiting for service to initialize + setup DB...$((15 - $i))\033[0K\r"; sleep 1; done; echo
sleep 3

# Run tests
./node_modules/.bin/_mocha -b --reporter=nyan test/**/*.js
result=$?

# Optionally get coverage report
if [[ $result == 0 && $COVERAGE == "true" ]]; then
  echo "Getting coverage report..."
  ./bin/get-coverage-report.sh $API_URL || exit 1
fi

if [[ $result != 0 ]]; then
  echo -e '\nFAILURE!\n\nServer logs below:\n\n' && cat $SERVER_LOG
fi

# Clean up
bin/killservice.sh

exit $result
