/* *****************************************************************************
* DEPENDENCIES
******************************************************************************/

// Packages
const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const Promise = require('bluebird');
const co = Promise.coroutine;
const _ = require('lodash');

/* *****************************************************************************
* CONSTANTS
******************************************************************************/

const API_URL = process.env.API_URL || `http://0.0.0.0:3000`;

let request;
if (process.env.SUPERTEST_APP) {
  const app = require('../../server/server.js');
  const server = app.listen(0);
  request = supertest(app);
} else {
  console.log(`API at url: ${API_URL}`);
  request = supertest(API_URL);
}

const API = '/api';
const PLANGRID_ROUTE = `${API}/plangrid`;

const HTML_RESPONSE = '<p>Hello, World</p>';

/* *****************************************************************************
* TEST CASES
******************************************************************************/
describe('Plangrid Service API', function() {
  this.timeout(5000);

  // ---------------------------------------------------------------------------
  // BEFORE ALL HOOK
  // ---------------------------------------------------------------------------

  // Connect to the DB with client
  before((done) => {
    done()
  });

  // ---------------------------------------------------------------------------
  // GET /api/plangrid
  // ---------------------------------------------------------------------------

  describe('GET /api/plangrid', () => {

    it('Returns JSON when Accept Header is set to application/json.', (done) => {
      request.get(`${PLANGRID_ROUTE}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const result = res.body;
        expect(result.message).to.equal('Good morning');
        done();
      }).catch((err) => { done(err); });
    });

    it('Returns JSON when Accept Header is not set', (done) => {
      request.get(`${PLANGRID_ROUTE}`)
      .set('Accept', '')
      .expect(200)
      .then(res => {
        expect(res.text).to.equal(HTML_RESPONSE);
        done();
      }).catch((err) => { done(err); });
    });

  });

  // ---------------------------------------------------------------------------
  // POST /api/plangrid
  // ---------------------------------------------------------------------------

  describe('POST /api/plangrid', () => {

    it('Returns 201', (done) => {
      request.post(`${PLANGRID_ROUTE}`)
      .expect(201)
      .then(res => {
        done();
      }).catch((err) => { done(err); });
    });

  });

  // ---------------------------------------------------------------------------
  // GET /api/status
  // ---------------------------------------------------------------------------

  describe('GET /api/status', () => {
    it('Get API status', (done) => {
      request.get(`${API}/status`)
      .expect(200, done);
    });
  });


});
