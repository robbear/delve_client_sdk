import {
  CreateComputeRequestProtocol,
  DeleteComputeRequestProtocol,
  UpdateDatabaseRequestProtocol
} from '../index.js';

/**
 * Implements the RaiCloud API
 *
 * @alias module:RAICloudAPIMixin
 * @param {Constructor<Connection>} Base
 */
 function RAICloudAPIMixin(Base) {
  class RAICloudAPI extends Base {

    _localServerError(methodName) {
        return `The method, ${methodName}, is not available on a local server connection.`;
    }

    /**
     * List the computes belonging to the account user, optionally filtered
     * by compute ID, compute name, compute size, and provisioned state.
     *
     * @param {Object} opts Optional parameters
     * @param {Array.<String>} opts.id - ID of a compute
     * @param {Array.<String>} opts.name - Name of a compute
     * @param {Array.<String>} opts.size - Size is one of "XS", "S", "M", "L", "XL"
     * @param {Array.<String>} opts.state - One of: "REQUESTED","PROVISIONING", "REGISTERING", "PROVISIONED",
     * "PROVISION_FAILED", "DELETE_REQUESTED", "STOPPING", "DELETING", "DELETED", "DELETION_FAILED"
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is of type `ListComputesResponseProtocol`
     */
    listComputes(opts) {
      return new Promise((resolve, reject) => {
        if (this.isLocalServer) {
          reject(new Error(this._localServerError('listComputes')));
          return;
        }

        try {
          this.defaultApi.computeGet(opts, (error, result, response) => {
            resolve({error, result, response});
          });
        }
        catch(e) {
          reject(e);
        }
      });
    }

    /**
     * Creates a compute under a user account.
     *
     * @param {String} name - Name of the compute to create
     * @param {String} size - Size is one of "XS", "S", "M", "L", "XL"
     * @param {String} region - Region where the compute should be created
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is of type `CreateComputeResponseProtocol`
     */
    createCompute(name, size = "xs", region = null) {
      region = region || 'us-east';

      return new Promise((resolve, reject) => {
        if (this.isLocalServer) {
          reject(new Error(this._localServerError('createCompute')));
          return;
        }

        try {
          const ccrp = CreateComputeRequestProtocol.constructFromObject({
            name, size, region
          });

          this.defaultApi.computePut(ccrp, (error, result, response) => {
            resolve({error, result, response});
          });
        }
        catch(e) {
          reject(e);
        }
      });
    }

    /**
     *
     * @param {String} name - Name of the compute to delete
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is of type `DeleteComputeResponseProtocol`
     */
    deleteCompute(name) {
      return new Promise((resolve, reject) => {
        if (this.isLocalServer) {
          reject(new Error(this._localServerError('deleteCompute')));
          return;
        }

        try {
          const dcp = DeleteComputeRequestProtocol.constructFromObject({name});

          this.defaultApi.computeDelete(dcp, (error, result, response) => {
            resolve({error, result, response});
          });
        }
        catch(e) {
          reject(e);
        }
      });
    }

    /**
     * Remove the database's association with its current default compute
     *
     * @param {String} dbname - Database name associated with the default compute
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is an empty object {}
     */
    removeDefaultCompute(dbname) {
      return this.updateDatabase(dbname, null, true, false);
    }

    /**
     * Update the database's association with a default compute.
     *
     * @param {String} dbname - The name of the database
     * @param {String} defaultComputeName - The name of the compute to associate with the database
     * @param {Boolean} removeDefaultCompute - If true, remove the default compute association from the database
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is an empty object {}`
     */
    updateDatabase(dbname, defaultComputeName, removeDefaultCompute) {
      return new Promise((resolve, reject) => {
        if (this.isLocalServer) {
          reject(new Error(this._localServerError('updateDatabase')));
          return;
        }

        try {
          const udrp = UpdateDatabaseRequestProtocol.constructFromObject({
            name: dbname,
            default_compute_name: defaultComputeName,
            remove_default_compute: removeDefaultCompute
          });

          this.defaultApi.databasePost(udrp, (error, result, response) => {
            resolve({error, result, response});
          });
        }
        catch(e) {
          reject(e);
        }
      });
    }

    /**
     * List the events associated with a specified compute.
     *
     * @param {String} computeId - The identifier of the compute
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is of type `ComputeEventInfo`
     */
    listComputeEvents(computeId) {
      return new Promise((resolve, reject) => {
        if (this.isLocalServer) {
          reject(new Error(this._localServerError('listComputeEvents')));
          return;
        }

        try {
          this.defaultApi.listComputeEvents(computeId, (error, result, response) => {
            resolve({error, result, response});
          });
        }
        catch(e) {
          reject(e);
        }
      });
    }

    /**
     * List the databases belonging to the account user, optionally filtered
     * by database ID, database name, and database state.
     *
     * @param {Object} opts Optional parameters
     * @param {Array.<String>} opts.id - ID of a database
     * @param {Array.<String>} opts.name - Name of a database
     * @param {Array.<String>} opts.state - One of ...
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is of type `ListDatabasesResponseProtocol`
     */
    listDatabases(opts) {
      return new Promise((resolve, reject) => {
        if (this.isLocalServer) {
          reject(new Error(this._localServerError('listDatabases')));
          return;
        }

        try {
          this.defaultApi.databaseGet(opts, (error, result, response) => {
            resolve({error, result, response});
          });
        }
        catch(e) {
          reject(e);
        }
      });
    }

  }

  return RAICloudAPI;
}

export default RAICloudAPIMixin;
