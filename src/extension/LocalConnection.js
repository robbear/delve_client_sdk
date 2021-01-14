const sdk = require('delve_client_sdk')
const api = new sdk.DefaultApi()

const connection = require('./Connection')

/** Class representing a LocalConnection. */
class LocalConnection extends connection.Connection {
    /**
     * Create a Connection
     * @param {string} dbname - Name of database to query.
     * @param {Object} [params={}] - User specified override values.
     * @param {string} [params.scheme="http"] - Connection scheme.
     * @param {string} [params.host="127.0.0.1"] - Address of running server.
     * @param {number} [params.port=8010] - Port of running server. *Must be an Integer.*
     * @param {string} [params.debugLevel=0] - Desired debugging level.
     * @param {number} [params.connectionTimeout=300] - Connection timeout duration.
     * @param {Transaction.ModeEnum} [params.defaultOpenMode=OPEN] - Default transaction mode.
     */
    constructor(dbname, params={}) {
        // Construct parent class, `Connection`, from `params` object
        super(params)

        // Ensure `dbname` is provided, throw error if not
        if (typeof dbname === 'undefined' || dbname === '') {
            throw new Error('Must provide `dbname`.')
        }
        
        // Set _dbname
        this._dbname = dbname
    }
    
    /**
     * Get name of database
     */
    get dbname() {
        return this._dbname
    }

    /**
     * Setter for dbname
     */
    set dbname(name) {
       this._dbname = name
    }

    /**
     * Return cardinality of relations in Delve db `dbname`
     * @param {string} relname - Name of relation.
     * @return {Promise}
     */
    cardinality(relname) {
        return new Promise((resolve, reject) => {

            let action = new sdk.CardinalityAction()
            action.type = 'CardinalityAction'
            
            if (typeof relname !== 'undefined' && relname !== '') {
                action.relname = relname
            }

            this.runAction(action)
                .then(res => {
                    resolve(res.actions[0].result.result)
                })
                .catch(reject)
        })
    }

    /**
     * Create a Delve database
     * @return {Promise}
     */
    create_database() {
        return new Promise((resolve, reject) => {
            let transaction = new sdk.Transaction()
            transaction.mode = this.defaultOpenMode
            transaction.dbname = this.dbname
            transaction.readonly = false
            transaction.actions = []

            api.transactionPost(transaction, (error, data) => {
                if (error) {
                    reject(error)
                } else {
                    this.defaultOpenMode = 'OPEN'
                    resolve(data)
                }
            })
        })
    }

    /**
     * Delete a Delve source
     * @param {string} sourceName - Name of source.
     * @return {Promise}
     */
    delete_source(sourceName) {
        if (typeof sourceName === 'undefined' || sourceName === '') {
            throw new Error("Must provide valid `sourceName`.")
        }

        return new Promise((resolve, reject) => {
            let action = new sdk.ModifyWorkspaceAction() 
            action.type = 'ModifyWorkspaceAction'
            action.delete_source = []
            action.delete_source.push(sourceName)

            this.runAction(action, { 'isReadOnly': false })
                .then(resolve)
                .catch(reject)
        })
    }

    /**
     * Install a Delve source
     * @param {string} sourceName - Name of source.
     * @param {string} sourceStr - Delve relations to install
     * @return {Promise}
     */
    install_source(sourceName, sourceStr) {
        if (typeof sourceStr === 'undefined' || sourceStr === '') {
            throw new Error("Must provide valid `source`.")
        }

        return new Promise((resolve, reject) => {
            let source = new sdk.Source()
            source.name = sourceName || ''
            source.value = sourceStr
            source.type = 'Source'

            let action = new sdk.InstallAction()
            action.sources = []
            action.sources.push(source)
            action.type = 'InstallAction'

            this.runAction(action, { 'isReadOnly': false })
                .then(resolve)
                .catch(reject)
        })
    }

    /**
     * List Extensional Databases (EDBs) in Delve db `dbname`
     * @params {string} relname - Name of relation.
     * @return {Promise}
     */
    list_edb(relname) {
        return new Promise((resolve, reject) => { 
            let action = new sdk.ListEdbAction()
            action.type = 'ListEdbAction'

            if (typeof relname !== 'undefined' && relname !== '') {
                action.relname = relname
            }

            this.runAction(action)
                .then(res => {
                    resolve(res.actions[0].result.rels)
                })
                .catch(reject)
        })
    }

    /**
     * List sources installed in Delve
     * @return {Promise}
     */
    list_source() {
        return new Promise((resolve, reject) => {
            let action = new sdk.ListSourceAction()
            action.sources = []
            action.sources.push()
            action.type = 'ListSourceAction'

            this.runAction(action)
                .then(res => {
                    resolve(res.actions[0].result)
                })
                .catch(reject)
        })
    }

    /**
     * Load a CSV file *local* to the Delve Server
     * referenced by `this`
     */
    //load_csv() {}
    
    /**
     * Load a JSON file *local* to the Delve Server
     * referenced by `this`
     */
    //load_json() {}
    
    /**
     * Query a local Delve server
     * @param {Object} params - User specified override values.
     * @param {string[]} params.out=[] - Name(s) of relation(s) to return. *Required*
     * @param {string} [params.query=''] - Delve query.
     * @param {string} [params.name='query'] - Action name.
     * @param {string} [params.path=''] -
     * @param {string[]} [params.inputs=[]] -
     * @param {string[]} [params.persist=[]] - Name(s) of relation(s) to persist.
     * @return {Promise}
     */
    query(params) {
        // Check if `outputs` is valid, exit if not.
        if (typeof params.out === 'undefined' || params.out === null || params.out.length === null || params.out.length === 0) {
            throw new Error("`params.outputs` array must have values.")
        }

        return new Promise((resolve, reject) => { 
            let action = new sdk.QueryAction()
            action.source = new sdk.Source()
            action.source.value = params.query || ''
            action.source.type = 'Source'
            
            action.outputs = []
            action.outputs.push(params.out)
        
            action.source.name = params.name || 'query'
            action.source.path = params.path || '' 
            action.inputs = params.inputs || []
            action.persist = params.persist || []
            action.type = 'QueryAction'

            this.runAction(action)
                .then(res => {
                    resolve(res.actions[0].result.output)
                })
                .catch(reject)
        })
    }

    /**
     * Instantiate then populate `Transaction` and `LabeledAction` objects
     * for transaction with the rAI Language Server via `transactionPost`.
     * @param {QueryAction} action - Object representing Delve query.
     * @param {Object} [params={}] - User specified override values.
     * @param {string='single'} params.name - Name of LabeledAction.
     * @param {boolean=true} params.isReadOnly - Transaction is read only?
     * @return {Promise}
     */
    runAction(action, params={}) {
        // Check `action` is valid
        return new Promise((resolve, reject) => {
            let labeledAction = new sdk.LabeledAction()
            labeledAction.name = params.name || 'single'
            labeledAction.action = action

            let transaction = new sdk.Transaction()
            transaction.mode = this.defaultOpenMode
            transaction.dbname = this.dbname
            transaction.readonly = params.hasOwnProperty("isReadOnly") ? params.isReadOnly : true

            transaction.actions = []
            transaction.actions.push(labeledAction)

            api.transactionPost(transaction, (error, data) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(data)
                }
            })
        })
    }

    //
    // Custom methods
    //

    cardinalityX(relname) {
        let action = new sdk.CardinalityAction()
        action.type = 'CardinalityAction'
          
        if (typeof relname !== 'undefined' && relname !== '') {
            action.relname = relname
        }

        return this.runActionX(action)
    }

    create_databaseX() {
        return new Promise((resolve, reject) => {
            let transaction = new sdk.Transaction()
            transaction.mode = this.defaultOpenMode
            transaction.dbname = this.dbname
            transaction.readonly = false
            transaction.actions = []

            api.transactionPost(transaction, (error, data, response) => {
                if (error) {
                    reject(error)
                } else {
                  this.defaultOpenMode = 'OPEN'
                  resolve({data, response})
                }
            })
        })
    }

    delete_sourceX(sourceName) {
        if (typeof sourceName === 'undefined' || sourceName === '') {
            throw new Error("Must provide valid `sourceName`.")
        }

        let action = new sdk.ModifyWorkspaceAction() 
        action.type = 'ModifyWorkspaceAction'
        action.delete_source = []
        action.delete_source.push(sourceName)

        return this.runActionX(action, { 'isReadOnly': false })
    }

    install_sourceX(sourceName, sourceStr) {
        if (typeof sourceStr === 'undefined' || sourceStr === '') {
            throw new Error("Must provide valid `source`.")
        }

        let source = new sdk.Source()
        source.name = sourceName || ''
        source.value = sourceStr
        source.type = 'Source'

        let action = new sdk.InstallAction()
        action.sources = []
        action.sources.push(source)
        action.type = 'InstallAction'

        return this.runActionX(action, { 'isReadOnly': false })
    }

    list_edbX(relname) {
        let action = new sdk.ListEdbAction()
        action.type = 'ListEdbAction'

        if (typeof relname !== 'undefined' && relname !== '') {
            action.relname = relname
        }

        return this.runActionX(action)
    }

    list_sourceX() {
        let action = new sdk.ListSourceAction()
        action.sources = []
        action.sources.push()
        action.type = 'ListSourceAction'

        return this.runActionX(action)
    }

    //load_csvX() {}
    
    /**
     * Load a JSON file *local* to the Delve Server
     * referenced by `this`
     */
    //load_jsonX() {}

    queryX(params) {
      // Check if `outputs` is valid, exit if not.
      if (typeof params.out === 'undefined' || params.out === null || params.out.length === null || params.out.length === 0) {
          throw new Error("`params.outputs` array must have values.")
      }

      let action = new sdk.QueryAction()
      action.source = new sdk.Source()
      action.source.value = params.query || ''
      action.source.type = 'Source'
      
      action.outputs = []
      action.outputs.push(params.out)
  
      action.source.name = params.name || 'query'
      action.source.path = params.path || '' 
      action.inputs = params.inputs || []
      action.persist = params.persist || []
      action.type = 'QueryAction'

      return this.runActionX(action);
  }

  runActionX(action, params={}) {
      // Check `action` is valid
      return new Promise((resolve, reject) => {
          let labeledAction = new sdk.LabeledAction()
          labeledAction.name = params.name || 'single'
          labeledAction.action = action

          let transaction = new sdk.Transaction()
          transaction.mode = this.defaultOpenMode
          transaction.dbname = this.dbname
          transaction.readonly = params.hasOwnProperty("isReadOnly") ? params.isReadOnly : true

          transaction.actions = []
          transaction.actions.push(labeledAction)

          api.transactionPost(transaction, (error, data, response) => {
              if (error) {
                  reject(error)
              } else {
                  resolve({data, response})
              }
          })
      })
  }

}

module.exports = { LocalConnection: LocalConnection }