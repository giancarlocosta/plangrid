#!/bin/bash
set -x

cd "$(dirname "$0")/.."

export DB_BASENAME="db_name_here"

# Install dependencies
echo "Installing test dependencies"
node -v | grep v[89] || { echo "Node Version must be >= 8"; exit 1; }
npm install --verbose || exit 1

# The name of the host to test is given as a parameter
export SERVICE_HOST=${1-"0.0.0.0"}

# Source env vars for other bin and test scripts
. env/test.env

# Start cluster
echo -e "\nStarting cluster ..."
bin/cluster-up.sh || exit 1

# Overwrite some sourced env vars so test scripts work
echo -e "\nStarting tests ..."
export API_URL="http://$SERVICE_HOST:3000"
export DB_HOSTS=$SERVICE_HOST
node_modules/.bin/_mocha -b test/**/*.js
result=$?

if [[ $result != 0 ]]; then
  echo -e '\nFAILURE!\n\nServer logs below:\n\n' && docker logs plangrid-service
fi

# Clean up
bin/cluster-down.sh

exit $result
