const assert = require('assert');
import Connection from '../../src/sdk/Connection.js';

// TODO: These tests are disabled in CI (see `skip` below). Enable them against a dev version of infra.
// Connection variable for reuse in tests
const azurePath = 'https://azure-ux.relationalai.com';
const accessToken = '### Replace with actual access token ###';
const computeName = 'tests';
const dbname = 'unittest-dbname-1';

function createConnection() {
  return new Connection({
    basePath: azurePath,
    accessToken: accessToken
  });
}

describe.skip('RAICloudAPIMixin', () => {
  describe('#Basic integration tests against hard-coded RAICloud credentials', () => {
    let computeId = null;

    it('refuses a call to listComputes on a local server connection', () => {
      const localConn = new Connection({isLocalServer: true});
      return localConn.listComputes().then(res => {
        assert(false);
      }).catch(error => {
        assert.strictEqual(error.message, 'The method, listComputes, is not available on a local server connection.');
      });
    });
    it('unfiltered list of existing computes - there should be at least one', () => {
      const conn = createConnection();

      return conn.listComputes().then(res => {
        //console.log(res.result.computes);
        assert.strictEqual(res.error, null);
        assert.notStrictEqual(res.result.computes.length, 0);
      });
    }).timeout(60000);
    it(`filters the existing computes on "XS"`, () => {
      const conn = createConnection();

      const options = {
        size: ['XS']
      }

      return conn.listComputes(options).then(res => {
        //console.log(res.result.computes);
        assert.strictEqual(res.error, null);
        assert.notStrictEqual(res.result.computes.length, 0);
      });
    }).timeout(60000);
    it('filters the existing computes on name', () => {
      const conn = createConnection();

      const options = {
        name: [computeName]
      }

      return conn.listComputes(options).then(res => {
        //console.log(res.result.computes);
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.computes.length, 1);

        // Cache away the computeId for further tests
        if (!res.error) {
          computeId = res.result.computes[0].id;
        }
      });
    }).timeout(60000);
    it(`creates a database named "${dbname}"`, () => {
      const conn = createConnection();

      return conn.createDatabase(dbname, computeName, true).then(res => {
        //console.log(res.error);
        //console.log(res.result.problems);
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`lists the account's databases`, () => {
      const conn = createConnection();

      return conn.listDatabases().then(res => {
        //console.log(res.error);
        //console.log(res.result);
        assert.strictEqual(res.error, null);
        assert.notStrictEqual(res.result.databases.length, 0);
      });
    }).timeout(60000);
    it(`lists the accounts's databases filtered on "${dbname}"`, () => {
      const conn = createConnection();

      return conn.listDatabases({name: [dbname]}).then(res => {
        //console.log(res.error);
        //console.log(res.result);
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.databases.length, 1);
      });
    }).timeout(60000);
    it(`lists the account's databases and finds "${dbname}" on default compute named "${computeName}"`, () => {
      const conn = createConnection();

      return conn.listDatabases({name: [dbname]}).then(res => {
        //console.log(res.error);
        //console.log(res.result);
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.databases.length, 1);
        assert.strictEqual(res.result.databases[0].default_compute_name, computeName);
      });
    }).timeout(60000);
    it(`issues a database query`, () => {
      const conn = createConnection();

      return conn.query(dbname, computeName, `def output = 19940506`).then(res => {
        //console.log(res.error);
        //console.log(res.result.problems);
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.output[0].columns[0][0], 19940506);
      });
    }).timeout(60000);
    it(`lists the computes events`, () => {
      const conn = createConnection();

      assert.notStrictEqual(computeId, null);

      return conn.listComputeEvents(computeId).then(res => {
        //console.log(res.error);
        //console.log(res.result);
        assert.strictEqual(res.error, null);
        assert.notStrictEqual(res.result.events.length, 0);
      });
    }).timeout(60000);
  });

});
