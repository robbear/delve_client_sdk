const assert = require('assert')
const sdk = require('../../src/index.js');
const Connection = require('../../src/sdk/Connection.js')

// Test Connection object
describe('Connection', () => {
    // Test to ensure default parameters are set
    describe('#new with default params', () => {        
        const defaultConnection = new Connection()
        
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

    // Test to ensure Connection parameters may be set by user
    describe('#new with nondefault params', () => {        
        const nonDefaultConnection = new Connection({
            scheme: 'ws',
            host: '10.0.0.1',
            port: 9090,
            debugLevel: 77,
            connectionTimeout: 999,
            defaultOpenMode: sdk.Transaction.ModeEnum.OPEN_OR_CREATE
        })
        
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
            assert.strictEqual(nonDefaultConnection.defaultOpenMode, sdk.Transaction.ModeEnum.OPEN_OR_CREATE)
        })
    }) 

})
