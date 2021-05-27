import {
  CardinalityAction,
  InstallAction,
  LabeledAction,
  ListEdbAction,
  ListSourceAction,
  LoadData,
  LoadDataAction,
  ModifyWorkspaceAction,
  QueryAction,
  Source,
  Transaction } from '../index.js';

/**
 * Implements the Rel high-level API
 *
 * @alias module:RelAPIMixin
 * @param {Constructor<Connection>} Base
 */
function RelAPIMixin(Base) {
  class RelAPI extends Base {

    /**
     * Run `actions` against the database `dbname`
     *
     * @param {String} dbname
     * @param {String} computeName
     * @param {LabeledAction[]} actions
     * @param {Boolean} isReadOnly
     * @param {ModeEnum} mode
     * @returns {Promise}
     */
    runActions(dbname, computeName, actions, isReadOnly, mode) {
      return new Promise((resolve, reject) => {
        let transaction = new Transaction();
        transaction.mode = mode;
        transaction.dbname = dbname;
        transaction.computeName = computeName;
        transaction.readonly = isReadOnly;
        transaction.actions = actions;
        transaction.version = this.getTransactionVersion(dbname);

        this._transactionPost(transaction, resolve, reject);
      });
    }

    /**
     * Run a single action against the database `dbname`
     *
     * @param {String} dbname - The name of the database
     * @param {String} computeName - The name of the compute
     * @param {LabeledAction} action - The LabeledAction to run
     * @param {Boolean} isReadOnly - If true, the transaction is read-only
     * @param {ModeEnum} mode - The transaction mode
     * @returns {Promise}
     */
    runAction(dbname, computeName, action, isReadOnly, mode) {
      return this.runActions(dbname, computeName, [action], isReadOnly, mode);
    }

    /**
     * Helper method to create a LabeledAction
     *
     * @param {*} name - Name for this action
     * @param {*} action - The action to be wrapped in LabeledAction
     */
    createLabeledAction(name, action) {
      let labeledAction = new LabeledAction();
      labeledAction.name = name;
      labeledAction.action = action;

      return labeledAction;
    }

    /**
     * Construct an action for `id` that when used in a transaction runs the logic
     * `source` as a read-only ad-hoc query. Request `outputs`.
     *
     * @param {String} name - Name for this action
     * @param {String} sourceString - The program
     * @param {String[]} outputs - The requested outputs for this query
     * @param {String[]} inputs - Inputs to this query
     * @returns {LabeledAction}
     */
    queryAction(name, sourceString, outputs=[], inputs=[]) {
      let source = new Source();
      source.name = 'query';
      source.path = '';
      source.value = sourceString;
      source.type = 'Source';

      let action = new QueryAction();
      action.inputs = inputs;
      action.outputs = outputs;
      action.persist = [];
      action.type = 'QueryAction';
      action.source = source;

      return this.createLabeledAction(name, action);
    }

    /**
     * Constructs an action to install a piece of source code, `sourceString`, into
     * the source `sourceName`. `name` will be used as the name of the action.
     *
     * @param {String} name - Name for this action
     * @param {String} sourceName - Name of source being installed
     * @param {String} sourceString - The source code to be installed
     * @param {String} sourcePath - The path specifier for the source to be installed. Defaults to sourceName.
     * @returns {LabeledAction}
     */
    installAction(name, sourceName, sourceString, sourcePath) {
      let source = new Source();
      source.name = sourceName;
      source.path = sourcePath ? sourcePath : sourceName;
      source.value = sourceString;
      source.type = 'Source';

      let action = new InstallAction();
      action.sources = [source];
      action.type = 'InstallAction';

      return this.createLabeledAction(name, action);
    }

    /**
     * Constructs an action to modify the workspace, such as deleting
     * source.
     *
     * @param {String} name - The name of this action
     * @param {String} sourceName - The source name to be modified
     */
    modifyWorkspaceAction(name, sourceName) {
      let action = new ModifyWorkspaceAction();
      action.type = 'ModifyWorkspaceAction';
      action.delete_source = [sourceName];

      return this.createLabeledAction(name, action);
    }

    /**
     * Constructs an action to list EDBs
     *
     * @param {String} name - The name of this action
     * @param {String} relname - The relation name to be listed
     */
    listEdbAction(name, relname) {
      let action = new ListEdbAction();
      action.type = 'ListEdbAction';
      action.relname = relname;

      return this.createLabeledAction(name, action);
    }

    /**
     * Constructs an action to show cardinality of a relation
     *
     * @param {String} name - The name of this action
     * @param {String} relname - The relation name whose cardinality to show
     */
    cardinalityAction(name, relname) {
      let action = new CardinalityAction();
      action.type = 'CardinalityAction';
      action.relname = relname;

      return this.createLabeledAction(name, action);
    }

    /**
     * Constructs an action to list sources installed in the database.
     *
     * @param {String} actionName - The name of this action
     */
    listSourceAction(actionName) {
      let action = new ListSourceAction();
      action.type = 'ListSourceAction';

      return this.createLabeledAction(actionName, action);
    }

    /**
     * Constructs an action to load JSON data
     *
     * @param {String} name - Name for this action
     * @param {String} data - String data in JSON format
     * @param {String} path - Path or url to JSON file if `data` is null
     * @param {String} relname - Relation name
     * @returns {LabledAction}
     */
     loadJSONAction(name, data, path, relname) {
      let loadData = new LoadData();
      loadData.content_type = 'application/json';
      loadData.data = data;
      loadData.path = path;
      loadData.key = [];

      let action = new LoadDataAction();
      action.rel = relname;
      action.value = loadData;
      action.type = 'LoadDataAction';

      return this.createLabeledAction(name, action)
    }

    /**
     * Query the database `dbname`
     *
     * @param {String} dbname - The database to connect to
     * @param {String} computeName - The name of the compute
     * @param {String} queryString - The source of the query to execute
     * @param {String} isReadOnly - Defaults to true, set to false for an update query
     * @param {String[]} outputs - Relation names to retrieve from the database and return
     * @param {String[]} inputs - Collection of relations to be loaded as input to the query
     * @param {String} actionName - Action name, defaults to 'action'
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     *
     * @example
     *  res = await query('testdb', 'def foo = 1', ['foo']);
     *  console.log(`error: ${res.error}, transactionResult: ${res.result}, responseObject: ${res.response}`);
     */
    query(dbname, computeName, queryString, isReadOnly=true, outputs=[], inputs=[], actionName = 'action') {
      const action = this.queryAction(actionName, queryString, outputs, inputs);

      return this.runAction(dbname, computeName, action, isReadOnly, Transaction.ModeEnum.OPEN);
    }

    /**
     * Install source, `sourceString` named `name` into the database `dbname`
     *
     * @param {String} dbname - The name of the database
     * @param {String} computeName - The name of the compute
     * @param {String} sourceName - Source name to install
     * @param {String} sourceString - Source code to be installed
     * @param {String} sourcePath - Source path for source to be installed. Defaults to sourceName.
     * @param {String} actionName - The action name
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    installSource(dbname, computeName, sourceName, sourceString, sourcePath = null, actionName = 'action') {
      const action = this.installAction(actionName, sourceName, sourceString, sourcePath);

      return this.runAction(dbname, computeName, action, false, Transaction.ModeEnum.OPEN);
    }

    /**
     * Deletes a source named `sourceName` from the database.
     *
     * @param {String} dbname - The database name
     * @param {String} computeName - The name of the compute
     * @param {String} sourceName - The name of the source to delete
     * @param {String} actionName - The name of the action
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    deleteSource(dbname, computeName, sourceName, actionName = 'action') {
      const action = this.modifyWorkspaceAction(actionName, sourceName);

      return this.runAction(dbname, computeName, action, false, Transaction.ModeEnum.OPEN);
    }

    /**
     * List sources installed in database `dbname`
     *
     * @param {String} dbname - The database name
     * @param {String} computeName - The name of the compute
     * @param {String} actionName - The name of the action
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    listSources(dbname, computeName, actionName = 'action') {
      const action = this.listSourceAction(actionName);

      return this.runAction(dbname, computeName, action, false, Transaction.ModeEnum.OPEN);
    }

    /**
     * Create database with name `dbname`, optionally overwriting the existing one.
     *
     * @param {String} dbname - The database name
     * @param {String} computeName - The name of the compute associated with the created database
     * @param {Boolean} overwrite - If true, overwrites an existing database of name `dbname`
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    createDatabase(dbname, computeName, overwrite) {
      const mode = overwrite
        ? Transaction.ModeEnum.CREATE_OVERWRITE
        : Transaction.ModeEnum.CREATE;

      return this.runActions(dbname, computeName, [], false, mode);
    }

    /**
     * Test a connection to the database named `dbname`
     *
     * @param {String} dbname - The database name
     * @param {String} computeName - The compute name
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    connectToDatabase(dbname, computeName) {
      return this.runActions(dbname, computeName, [], true, Transaction.ModeEnum.OPEN);
    }

    /**
     * Create a new database instance by cloning from an existing database, with all of the
     * same state as the old database but with a new name.
     *
     * If overwrite=true is passed, an existing database at `cloneName` will be overwritten
     * with `dbName`'s contents.
     *
     * @param {String} cloneName - The name of the new, cloned database
     * @param {String} dbName - The name of the database from which to create the clone
     * @param {String} computeName - The name of the compute
     * @param {Boolean} overwrite - If true, overwrites an existing database of name `cloneName`
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    cloneDatabase(cloneName, dbName, computeName, overwrite) {
      const mode = overwrite
        ? Transaction.ModeEnum.CLONE_OVERWRITE
        : Transaction.ModeEnum.CLONE;

      return new Promise((resolve, reject) => {
        let transaction = new Transaction();
        transaction.mode = mode;
        transaction.dbname = cloneName;
        transaction.source_dbname = dbName;
        transaction.computeName = computeName;
        transaction.readonly = false;
        transaction.actions = [];

        this._transactionPost(transaction, resolve, reject);
      });
    }

    /**
     * List Extensional Databases in database `dbname` with the relation name `relname`
     *
     * @param {String} dbname - The name of the database
     * @param {String} computeName - The name of the compute
     * @param {String} relname - The relationship name to list
     * @param {String} actionName - The name of this action
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    listEdb(dbname, computeName, relname, actionName = 'action') {
      const action = this.listEdbAction(actionName, relname);

      return this.runAction(dbname, computeName, action, true, Transaction.ModeEnum.OPEN);
    }

    /**
     * Return the cardinality of relation `relname` in database `dbname`.
     *
     * @param {String} dbname - The name of the database
     * @param {String} computeName - The name of the compute
     * @param {String} relname - The relationship whose cardinality is to be listed
     * @param {String} actionName - The name of this action
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    cardinality(dbname, computeName, relname, actionName = 'action') {
      const action = this.cardinalityAction(actionName, relname);

      return this.runAction(dbname, computeName, action, true, Transaction.ModeEnum.OPEN);
    }

    /**
     * Import a JSON string or a JSON file
     * Deprecated - Use the language-internal query instead.
     *
     * @param {String} dbname - The name of the database
     * @param {String} computeName - The name of the compute
     * @param {String} data - A string representing the JSON to import. Provide either `data` or `path`
     * @param {String} path - Path to a JSON file. Provide either `data` or `path`
     * @param {String} relname - The relation name to use for referencing the JSON data
     * @returns {Promise} - Resolves to object: {error, result, response} where
     * `result` is a `TransactionResult`.
     */
    loadJSON(dbname, computeName, data, path, relname, actionName = 'action') {
      console.warn('loadJSON is deprecated. Use the language-internal query instead.');

      const action = this.loadJSONAction(actionName, data, path, relname);

      return this.runAction(dbname, computeName, action, false, Transaction.ModeEnum.OPEN);
    }

    //
    // Internal helper calling `transactionPost` while managing
    // the transaction version and populating the compute name.
    //
    _transactionPost(transaction, resolve, reject) {
      const dbname = transaction.dbname;
      let self = this;
      try {
        this.defaultApi.transactionPost(transaction, (error, result, response) => {
          if (result && result.version > self.getTransactionVersion(dbname)) {
            self.setTransactionVersion(dbname, result.version);
          }
          resolve({error, result, response});
        });
      }
      catch(e) {
        reject(e);
      }
    }
  }

  return RelAPI;
}

export default RelAPIMixin;
