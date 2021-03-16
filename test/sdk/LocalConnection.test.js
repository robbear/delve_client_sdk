const assert = require('assert');
import LocalConnection from '../../src/sdk/LocalConnection.js';

const dbname = `sdk-unit-tests-db`;

describe ('LocalConnection', () => {
  describe('#custom connection', () => {
    it('properly fails on connecting through a custom connection', () => {
      const basePath = 'https://foo.bar.baz:1234';
      let lc = new LocalConnection({
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
