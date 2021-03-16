import { DefaultApi } from '../index.js';
import ApiClient from '../ApiClient.js';

/**
 * Base class representing a connection to the Rel server
 */
class ConnectionBase {
  /**
   * Create a connection
   * @param {String} [params.basePath] - The base URL against which to resolve every API call's (relative) path.
   * The default is http://127.0.0.1:8010.
   * @param {Array.<String>} [params.authentications] - The authentication methods to be included for all API calls.
   * This is a placeholder for eventual use with the cloud connection.
   * @param {Array.<String>} [params.defaultHeaders] - The default HTTP headers to be included for all API calls.
   * The default is {}
   * @param {Number} [params.timeout] - The default HTTP timeout for all API calls. The default is 60000
   * @param {Boolean} [params.cache] - If set to false an additional timestamp parameter is added to all API GET
   * calls to prevent browser caching. The default is true
   * @param {Boolean} [params.enableCookies] - If set to true, the client will save the cookies from each server
   * response, and return them in the next request.
   */
  constructor(params = {}) {
    const apiClient = new ApiClient();
    this._defaultApi = new DefaultApi(apiClient);
    this._api = this._defaultApi.apiClient;
    this._versionMap = new Map()

    if (params.basePath) {
      this._api.basePath = params.basePath;
    }
    if (params.authentications) {
      this._api.authentications = params.authentications;
    }
    if (params.defaultHeaders) {
      this._api.defaultHeaders = params.defaultHeaders;
    }
    if (params.hasOwnProperty('timeout')) {
      this._api.timeout = params.timeout;
    }
    if (params.hasOwnProperty('cache')) {
      this._api.cache = params.cache;
    }
    if (params.hasOwnProperty('enableCookies')) {
      this._api.enableCookies = params.enableCookies;
    }
  }

  get api() {
    return this._api;
  }

  get defaultApi() {
    return this._defaultApi;
  }

  get transactionPost() {
    return this._transactionPost;
  }

  get basePath() {
    return this._api.basePath;
  }
  set basePath(basePath) {
    this._api.basePath = basePath;
  }

  get authentications() {
    return this._api.authentications;
  }
  set authentications(authentications) {
    this._api.authentications = authentications;
  }

  get defaultHeaders() {
    return this._api.defaultHeaders;
  }
  set defaultHeaders(defaultHeaders) {
    this._api.defaultHeaders = defaultHeaders;
  }

  get cache() {
    return this._api.cache;
  }
  set cache(cache) {
    this._api.cache = cache;
  }

  get timeout() {
    return this._api.timeout;
  }
  set timeout(timeout) {
    this._api.timeout = timeout;
  }

  get enableCookies() {
    return this._api.enableCookies;
  }
  set enableCookies(enableCookies) {
    this._api.enableCookies = enableCookies;
  }

  /**
   * Returns the database's current transaction version value.
   *
   * @param {String} dbname - The name of the database
   */
  getTransactionVersion(dbname) {
    const version = this._versionMap.get(dbname);
    return version == null ? 0 : version;
  }

  /**
   * Sets the database's current transaction version value.
   *
   * @param {String} dbname - The name of the database
   * @param {Int} transactionVersion - The database's transaction version value
   */
  setTransactionVersion(dbname, transactionVersion) {
    this._versionMap.set(dbname, transactionVersion);
  }
}

export default ConnectionBase;
