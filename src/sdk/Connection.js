import { DefaultApi } from '../index.js';
import ApiClient from '../ApiClient.js';
import RelAPIMixin from './RelAPIMixin.js';
import RAICloudAPIMixin from './RAICloudAPIMixin.js';

/**
 * Class representing a connection to the RAI Infrastructure,
 * including the degenerate case of a local server.
 *
 * @mixes RelAPIMixin
 * @mixes RAICloudAPIMixin
 */
class Connection extends RelAPIMixin(RAICloudAPIMixin(class {})) {
  /**
   * Create a connection
   *
   * @param {Object} params Optional parameters
   * @param {String} params.basePath - The base URL against which to resolve every API call's (relative) path.
   * The default is http://127.0.0.1:8010.
   * @param {Number} params.timeout - The default HTTP timeout for all API calls. The default is 60000
   * @param {String} params.accessToken - The API access token
   */
  constructor(params = {}) {
    super(params);

    const apiClient = new ApiClient();
    this._defaultApi = new DefaultApi(apiClient);
    this._api = this._defaultApi.apiClient;
    this._versionMap = new Map()

    if (params.hasOwnProperty('basePath')) {
      this._api.basePath = params.basePath;
    }
    if (params.hasOwnProperty('timeout')) {
      this._api.timeout = params.timeout;
    }
    if (params.hasOwnProperty('isLocalServer')) {
      this.isLocalServer = params.isLocalServer;
    }
    if (params.hasOwnProperty('accessToken')) {
      this.accessToken = params.accessToken;
    } else {
      this.accessToken = '';
    }
  }

  get isLocalServer() {
    return !!this._isLocalServer;
  }
  set isLocalServer(isLocalServer) {
    this._isLocalServer = isLocalServer;
  }

  get accessToken() {
    return this._accessToken;
  }
  set accessToken(accessToken) {
    this._accessToken = accessToken;

    this._api.authentications = {
      'BearerAuth': {
        type: 'bearer',
        accessToken: this._accessToken
      }
    }
  }

  get api() {
    return this._api;
  }

  get defaultApi() {
    return this._defaultApi;
  }

  get basePath() {
    return this._api.basePath;
  }
  set basePath(basePath) {
    this._api.basePath = basePath;
  }

  get timeout() {
    return this._api.timeout;
  }
  set timeout(timeout) {
    this._api.timeout = timeout;
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

export default Connection;
