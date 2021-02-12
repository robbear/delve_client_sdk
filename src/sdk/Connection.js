const sdk = require('../index.js');

/** Class representing a Connection. */
class Connection {
    /**
     * Create a Connection
     * @param {Object} [params] - User specified override values.
     * @param {string} [params.scheme="http"] - Connection scheme.
     * @param {string} [params.host="127.0.0.1"] -Address of running server.
     * @param {number} [params.port=8010] - Port of running server. *Must be an Integer.*
     * @param {string} [params.debugLevel=0] - Desired debugging level.
     * @param {number} [params.connectionTimeout=300] - Connection timeout duration.
     * @param {Transaction.ModeEnum} [params.defaultOpenMode=OPEN]
     */
    constructor(params) {
        const _params = typeof params === 'undefined' ? new Object() : params
        
        this.scheme = _params.scheme || "http"
        this.host = _params.host || "127.0.0.1"
        this.port = _params.port || 8010
        this.debugLevel = _params.debugLevel || 0
        this.connectionTimeout = _params.connectionTimeout || 300 // seconds
        this.defaultOpenMode = _params.defaultOpenMode || sdk.Transaction.ModeEnum.OPEN
    }

    /**
     * Get connection scheme
     */
    get scheme() {
        return this._scheme
    }

    /**
     * Setter for scheme
     */
    set scheme(s) {
        this._scheme = s
    }

    /**
     * Get connection host
     */
    get host() {
        return this._host
    }

    /**
     * Setter for host
     */
    set host(addr) {
        this._host = addr
    }

    /**
     * Get connection port
     */
    get port() {
        return this._port
    }

    /**
     * Setter for port
     */
    set port(p) {
        this._port = p
    }

    /**
     * Get debug level.
     * @return {number} Current debug level.
     */
    get debugLevel() {
        return this._debugLevel
    }

    /**
     * Set debug level.
     * @param {number} level - Desired debug level.
     */
    set debugLevel(level) {
        this._debugLevel = level
    }

    /**
     * Get duration of connection timeout (seconds).
     * @return {number} Current connection timeout in seconds.
     */
    get connectionTimeout() {
        return this._connectionTimeout
    }

    /**
     * Set duration of connection timeout (seconds).
     * @param {number} duration - Duration of connection timeout, in seconds.
     */
    set connectionTimeout(duration) {
        this._connectionTimeout = duration
    }

    /**
     * Get connection defaultOpenMode
     */
    get defaultOpenMode() {
        return this._defaultOpenMode
    }

    /**
     * Setter for defaultOpenMode
     */
    set defaultOpenMode(mode) {
        this._defaultOpenMode = mode
    }
}

module.exports = Connection
