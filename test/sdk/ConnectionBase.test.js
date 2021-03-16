const assert = require('assert');
import ConnectionBase from '../../src/sdk/ConnectionBase.js';

describe('ConnectionBase', () => {
  describe('#default constructor', () => {
    let connection = new ConnectionBase();

    it('constructs a ConnectionBase object', () => {
      assert(connection);
    });
    it('has the default basePath of "http://127.0.0.1:8010', () => {
      assert.strictEqual(connection.basePath, 'http://127.0.0.1:8010');
    });
    it('has no default authentications', () => {
      assert.strictEqual(Object.keys(connection.authentications).length, 0);
    });
    it('has no defaultHeaders', () => {
      assert.strictEqual(Object.keys(connection.defaultHeaders).length, 0);
    });
    it('has cache set to true', () => {
      assert.strictEqual(connection.cache, true);
    });
    it('has a default timeout of 60000', () => {
      assert.strictEqual(connection.timeout, 60000);
    });
    it('has enableCookies set to false', () => {
      assert.strictEqual(connection.enableCookies, false);
    });
  });

  describe('#custom constructor', () => {
    const basePath = 'https://foo.bar.baz:1234';
    let connection = new ConnectionBase({
      basePath: basePath,
      cache: false,
      timeout: 300000,
      enableCookies: true
    });

    it(`has basePath of ${basePath}`, () => {
      assert.strictEqual(connection.basePath, basePath);
    });
    it('has no default authentications', () => {
      assert.strictEqual(Object.keys(connection.authentications).length, 0);
    });
    it('has no defaultHeaders', () => {
      assert.strictEqual(Object.keys(connection.defaultHeaders).length, 0);
    });
    it('has cache set to false', () => {
      assert.strictEqual(connection.cache, false);
    });
    it('has a default timeout of 300000', () => {
      assert.strictEqual(connection.timeout, 300000);
    });
    it('has enableCookies set to true', () => {
      assert.strictEqual(connection.enableCookies, true);
    });
  });
});
