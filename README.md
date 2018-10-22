# Plangrid Service

> HTTP Endpoint and Logging Exercise

## Contents

*   [Overview](#overview)
*   [Setup](#setup)
*   [Running](#running)
*   [Testing](#testing)

## Overview

HTTP Endpoint and Logging Exercise

## Setup

Requirements for running the application:

* Node.js >= 8

### Building

Installs app dependencies so you can run the server locally:
```
npm i
```

## Running

You can run the service with multiple configurations. Some options are below:
- `npm run debug` - Run server locally. Debug level logging.
- `npm run prod` - Run server locally. Notice level logging.

## Testing

##### Unit Tests
To run the unit tests, first stop your server, then run:
```
bin/test.sh
```

##### cURL Testing

To run curl tests, first start your server:
```
# Start server with debug level logging
npm run debug

# OR

# Start server with only notice level logging and above
npm run prod
```

Then you can use the following cURL commands to test the `/api/plangrid` endpoint:
```
# No Accept header sent
curl -H 'Accept: ' http://0.0.0.0:3000/api/plangrid

# application/json Accept header sent
curl -H 'Accept: application/json' http://0.0.0.0:3000/api/plangrid

# POST
curl -XPOST http://0.0.0.0:3000/api/plangrid
```
