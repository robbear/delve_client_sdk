const assert = require('assert');
import Connection from '../../src/sdk/Connection.js';

const dbname = `sdk-unit-tests-db`;

describe ('Connection', () => {
  describe('#default constructor', () => {
    let connection = new Connection();

    it('constructs a Connection object', () => {
      assert(connection);
    });
    it('has the default basePath of "http://127.0.0.1:8010', () => {
      assert.strictEqual(connection.basePath, 'http://127.0.0.1:8010');
    });
    it('has an empty accessToken', () => {
      assert.strictEqual(connection.accessToken, '');
    });
    it('has a default timeout of 60000', () => {
      assert.strictEqual(connection.timeout, 60000);
    });
  });

  describe('#custom constructor', () => {
    const basePath = 'https://foo.bar.baz:1234';
    let connection = new Connection({
      basePath: basePath,
      cache: false,
      timeout: 300000,
      enableCookies: true
    });

    it(`has basePath of ${basePath}`, () => {
      assert.strictEqual(connection.basePath, basePath);
    });
    it('has an empty accessToken', () => {
      assert.strictEqual(connection.accessToken, '');
    });
    it('has a default timeout of 300000', () => {
      assert.strictEqual(connection.timeout, 300000);
    });
  });

  describe('#custom connection', () => {
    it('properly fails on connecting through a custom connection', () => {
      const basePath = 'https://foo.bar.baz:1234';
      let lc = new Connection({
        basePath: basePath,
        cache: false,
        timeout: 300000,
        enableCookies: true
      });

      return lc.createDatabase(dbname, true).then(res => {
        assert.notStrictEqual(res.error, null);
      });
    }).timeout(60000);
  });
});
