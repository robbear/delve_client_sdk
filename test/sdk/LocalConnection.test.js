const assert = require('assert');
const sdk = require('../../src/index.js');
const LocalConnection = require('../../src/sdk/LocalConnection.js')

const dbname = 'local_connection_test'
const sourceNameOne = 'foo_source'

let defaultConnection;
let nonDefaultConnection;

before(() => {
    defaultConnection = new LocalConnection(dbname);
    nonDefaultConnection = new LocalConnection(dbname, {
        scheme: 'ws',
        host: '10.0.0.1',
        port: 9090,
        debugLevel: 77,
        connectionTimeout: 999,
        defaultOpenMode: 'OPEN_OR_CREATE'    
    });
});

// Helper function to determine set equality elementwise
const setsEqual = (a,b) => a.size === b.size && [...a].every(v => b.has(v))

describe('LocalConnection', () => {
    // Check that errors are thrown when `dbname` is not provided
    describe('#new with errors', () => {
        it('no `dbname` should error', () => {
            assert.throws(() => new LocalConnection(), Error, "Must provide `dbname`.")
        })

        it('empty string for `dbname` should error', () => {
            assert.throws(() => new LocalConnection(''), Error, "Must provide `dbname`.")
        })
    })

    // Test Default Connection Object
    describe('#new with default params', () => {        
        it('scheme should return "http"', () => {
            assert.strictEqual(defaultConnection.scheme, 'http')
        })

        it('host should return "127.0.0.1"', () => {
            assert.strictEqual(defaultConnection.host, '127.0.0.1')
        })

        it('port should return 8010', () => {
            assert.strictEqual(defaultConnection.port, 8010)
        })

        it('debugLevel should return 0', () => {
            assert.strictEqual(defaultConnection.debugLevel, 0)
        })

        it('connectionTimeout should return 300', () => {
            assert.strictEqual(defaultConnection.connectionTimeout, 300)
        })

        it('defaultOpenMode should return "OPEN"', () => {
            assert.strictEqual(defaultConnection.defaultOpenMode, sdk.Transaction.ModeEnum.OPEN)
        })
    }) 

    // Test Nondefault Connection Object
    describe('#new with default params', () => {        
        it('scheme should return "ws"', () => {
            assert.strictEqual(nonDefaultConnection.scheme, 'ws')
        })

        it('host should return "10.0.0.1"', () => {
            assert.strictEqual(nonDefaultConnection.host, '10.0.0.1')
        })

        it('port should return 9090', () => {
            assert.strictEqual(nonDefaultConnection.port, 9090)
        })

        it('debugLevel should return 77', () => {
            assert.strictEqual(nonDefaultConnection.debugLevel, 77)
        })

        it('connectionTimeout should return 999', () => {
            assert.strictEqual(nonDefaultConnection.connectionTimeout, 999)
        })

        it('defaultOpenMode should return "OPEN_OR_CREATE"', () => {
            assert.strictEqual(nonDefaultConnection.defaultOpenMode, 'OPEN_OR_CREATE')
        })
    }) 

    // Test `LocalConnection` methods
    describe('#create_database', () => {
        it('defaultOpenMode should return \'CREATE_OVERWRITE\'', () => {
            defaultConnection.defaultOpenMode = 'CREATE_OVERWRITE'
            assert.strictEqual(defaultConnection.defaultOpenMode, 'CREATE_OVERWRITE')
        })
        it('creation should happen without error', () => {
            return defaultConnection.create_database().then(res => {
                assert(res.problems.length === 0);
            });
        })
        it('defaultOpenMode should now return \'CREATE\'', () => {
            defaultConnection.defaultOpenMode = 'CREATE'
            assert.strictEqual(defaultConnection.defaultOpenMode, 'CREATE')
        })
        it('creation should fail (database already created, overwrite mode not set)', () => {
            return defaultConnection.create_database().then(() => {
                assert(false);
            })
            .catch(error => {
                // Delve Server throws "422 Unprocessable Entity" error
                // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422
                assert.strictEqual(error.response.status, 422);
            });
        })
        it('defaultOpenMode should still return \'CREATE\'', () => {
            assert.strictEqual(defaultConnection.defaultOpenMode, 'CREATE')
        })
        it('defaultOpenMode should now return \'OPEN\'', () => {
            defaultConnection.defaultOpenMode = 'OPEN'
            assert.strictEqual(defaultConnection.defaultOpenMode, 'OPEN')
        })
    })
    
    describe('#install_source', () => {
        it('`def foo = 1` should install without error', () => {
            return defaultConnection.install_source(sourceNameOne, 'def foo = 1').then(res => {
                assert(res.problems.length === 0);
            });
        })
        it('`def foo = ` should error on install', () => {
            return defaultConnection.install_source(sourceNameOne, 'def foo = ').then(res => {
                assert(res.problems.length === 2);
            });
        })
    })
    
    describe('#delete_source', () => {
        it(`${sourceNameOne} should delete without error`, () => {
            return defaultConnection.delete_source(sourceNameOne).then(res => {
                assert(res.problems.length === 0);
            });
        })
    })

    describe('#list_source', () => {
        it(`${sourceNameOne} should include the keys { "intrinsics" ; "stdlib ; "ml" }`, () => {
            return defaultConnection.list_source().then(res => {
                assert(setsEqual(new Set(res.sources.map(x => x.name)), new Set(["intrinsics", "stdlib", "ml"])));
            });
        })
    })

    describe('#query', () => {
        it(`def bar = 2`, () => {
            return defaultConnection.query({
                out: 'bar',
                query: 'def bar = 2',
            }).then(res => {
                assert(res.output[0].columns[0][0] === 2);
            });
        })
        it(`def p = {(1,); (2,); (3,)}`, () => {
            return defaultConnection.query({
                out: 'p',
                query: 'def p = {(1,); (2,); (3,)}',
            }).then(res => {
                assert(setsEqual(new Set(res.output[0].columns[0]), new Set([1,2,3])));
            });
        })
        it(`def p = {(1.1,); (2.2,); (3.4,)}`, () => {
            return defaultConnection.query({
                out: 'p',
                query: 'def p = {(1.1,); (2.2,); (3.4,)}',
            }).then(res => {
                assert(setsEqual(new Set(res.output[0].columns[0]), new Set([1.1,2.2,3.4])));
            });
        })
        it(`def p = {(parse_decimal[64, 2, \"1.1\"],); (parse_decimal[64, 2, \"2.2\"],); (parse_decimal[64, 2, \"3.4\"],)}`, () => {
            return defaultConnection.query({
                out: 'p',
                query: 'def p = {(parse_decimal[64, 2, \"1.1\"],); (parse_decimal[64, 2, \"2.2\"],); (parse_decimal[64, 2, \"3.4\"],)}',
            }).then(res => {
                assert(setsEqual(new Set(res.output[0].columns[0]), new Set([1.1,2.2,3.4])));
            });
        })
        it(`def p = {(1, 5); (2, 7); (3, 9)}`, () => {
            return defaultConnection.query({
                out: 'p',
                query: 'def p = {(1, 5); (2, 7); (3, 9)}',
            }).then(res => {
                let success = [];
                success = [[1,2,3],[5,7,9]].map((X,i) => {
                    return setsEqual(new Set(X), new Set(res.output[0].columns[i]));
                });
                assert.deepStrictEqual(success, [true, true]);
            });
        })
    })
    
    describe('#list_edb', () => {
        it(`create_database() should execute without error`, () => {
            defaultConnection.defaultOpenMode = 'CREATE_OVERWRITE'
            return defaultConnection.create_database().then(res => {
                assert(res.problems.length === 0);
            });
        });

        it(`list_edb() should be empty`, () => {
            return defaultConnection.list_edb().then(res => {
                assert(res.rels.length === 0);
            });
        });
    })

    describe('#cardinality', () => {
        it(`create_database() should execute without error`, () => {
            defaultConnection.defaultOpenMode = 'CREATE_OVERWRITE'
            return defaultConnection.create_database().then(res => {
                assert(res.problems.length === 0);
            });
        });
        it(`def p = {(1,); (2,); (3,)} should persist without error`, () => {
            return defaultConnection.query({
                out: 'p',
                persist: ['p'],
                query: 'def p = {(1,); (2,); (3,)}'
            }).then(res => {
                assert(setsEqual(new Set(res.output[0].columns[0]), new Set([1,2,3])));
            });
        })
        it(`cardinality of relation p is equal to 3`, () => {
            return defaultConnection.cardinality('p').then(res => {
                assert(res.result[0].columns[0][0] === 3);
            });
        })
    })
})
