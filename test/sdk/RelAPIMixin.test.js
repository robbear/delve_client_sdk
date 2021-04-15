const assert = require('assert');
const fs = require('fs').promises;
const os = require('os');
import LocalConnection from '../../src/sdk/LocalConnection.js';

const defaultSources = ["intrinsics", "stdlib", "ml"];
const incrementQuery =
`
def insert[:x] = x + 1
def delete[:x] = x
def output = x
`;

// LocalConnection variable for reuse in tests
let lc;

// Helper function to determine set equality elementwise
const setsEqual = (a,b) => a.size === b.size && [...a].every(v => b.has(v))

const initializeDatabase = (dbname) => it('initializes the connection and database for tests', () => {
  lc = new LocalConnection();
  return lc.createDatabase(dbname, true).then(res => {
    assert.strictEqual(res.result.problems.length, 0);
    assert.strictEqual(res.error, null);
  });
}).timeout(60000);

//
// Create unique names based on time and incrementing index value.
// Guarantees unique database names across individual tests and
// running instances of this test suite.
//
let nameIndex = 0;
function createUniqueName(prefix) {
  return `${prefix}${Date.now()}${nameIndex++}`;
}

describe('RelAPIMixin', () => {

  describe('#createDatabase', () => {
    const uniqueDbname = createUniqueName('db');
    const dbname = createUniqueName('db');

    lc = new LocalConnection();

    it('creates a database with create-and-overwrite', () => {
      return lc.createDatabase(dbname, true).then(res => {
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.error, null);
      });
    }).timeout(60000);
    it('is able to ping the database', () => {
      return lc.connectToDatabase(dbname).then(res => {
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.error, null);
      });
    }).timeout(60000);
    it('should return error status 422 when we create again without overwrite', () => {
      return lc.createDatabase(dbname, false).then(res => {
        assert.notStrictEqual(res.error, null);
        assert.strictEqual(res.error.status, 422);
        assert.notStrictEqual(res.result, null);
        assert.strictEqual(res.result.aborted, true);
      });
    }).timeout(60000);
    it(`creates a new database called ${uniqueDbname} without overwrite when it does not already exist`, () => {
      return lc.createDatabase(uniqueDbname, false).then(res => {
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.error, null);
      });
    }).timeout(60000);
  });

  describe('#source management', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it(`listSources for ${dbname} should include the keys [${defaultSources.join()}]`, () => {
      return lc.listSources(dbname).then(res => {
        assert.notStrictEqual(res.result.actions, null);
        assert.notStrictEqual(res.result.actions[0], null);
        assert.notStrictEqual(res.result.actions[0].result, null);
        assert.notStrictEqual(res.result.actions[0].result.sources, null);
        assert(setsEqual(new Set(res.result.actions[0].result.sources.map(x => x.name)), new Set(defaultSources)));
      });
    }).timeout(60000);
    it(`should install 'def foo = {(1,);(2,);(3,)}' without error into test-1.delve via #installSource`, () => {
      return lc.installSource(dbname, 'test-1.delve', 'def foo = {(1,);(2,);(3,)}').then(res => {
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.error, null);
      });
    }).timeout(60000);
    it(`should list test-1.delve in the result for #listSources`, () => {
      return lc.listSources(dbname).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.sources.length, defaultSources.length + 1);
        let match = false;
        for (let i = 0; i < (defaultSources.length + 1); i++) {
          if (res.result.actions[0].result.sources[i].name === 'test-1.delve') {
            match = true;
          }
        }
        assert(match);
      });
    }).timeout(60000);
    it(`should fail to install 'def foo = ' into test-1.delve`, () => {
      return lc.installSource(dbname, 'test-1.delve', 'def foo = ').then(res => {
        assert.strictEqual(res.error, null);
        assert.notStrictEqual(res.result, null);
        assert.notStrictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`should delete source test-1.delve`, () => {
      return lc.deleteSource(dbname, 'test-1.delve').then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`should be only ${defaultSources.length} sources installed now`, () => {
      return lc.listSources(dbname).then(res => {
        assert.strictEqual(res.result.actions[0].result.sources.length, defaultSources.length);
      });
    }).timeout(60000);
  });

  describe('#query', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it('def bar = 2', () => {
      return lc.query(dbname, 'def bar = 2', true, ['bar']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.output[0].columns[0][0], 2);
      });
    }).timeout(60000);
    it('def p = {(1,);(2,);(3,)}', () => {
      return lc.query(dbname, 'def p = {(1,);(2,);(3,)}', true, ['p']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert(setsEqual(new Set(res.result.actions[0].result.output[0].columns[0]), new Set([1,2,3])));
      });
    }).timeout(60000);
    it('def p = {(1, 5); (2, 7); (3, 9)}', () => {
      return lc.query(dbname, 'def p = {(1, 5); (2, 7); (3, 9)}', true, ['p']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        let success = [];
        success = [[1,2,3],[5,7,9]].map((X,i) => {
          return setsEqual(new Set(X), new Set(res.result.actions[0].result.output[0].columns[i]));
        });
        assert.deepStrictEqual(success, [true, true]);
      });
    }).timeout(60000);
  });

  describe('#top-level query', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it('def bar = 2', () => {
      return lc.query(dbname, 'def bar = 2\ndef output = bar').then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.output[0].columns[0][0], 2);
      });
    }).timeout(60000);
    it('def p = {(1,);(2,);(3,)}', () => {
      return lc.query(dbname, 'def p = {(1,);(2,);(3,)}\ndef output = p').then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert(setsEqual(new Set(res.result.output[0].columns[0]), new Set([1,2,3])));
      });
    }).timeout(60000);
    it('def p = {(1, 5); (2, 7); (3, 9)}', () => {
      return lc.query(dbname, 'def p = {(1, 5); (2, 7); (3, 9)}\ndef output = p').then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        let success = [];
        success = [[1,2,3],[5,7,9]].map((X,i) => {
          return setsEqual(new Set(X), new Set(res.result.output[0].columns[i]));
        });
        assert.deepStrictEqual(success, [true, true]);
      });
    }).timeout(60000);
  });

  describe('#both standard and top-level query', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it('def bar = 2', () => {
      return lc.query(dbname, 'def bar = 2\ndef output = bar', true, ['bar']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.output[0].columns[0][0], 2);
        assert.strictEqual(res.result.output[0].columns[0][0], 2);
      });
    }).timeout(60000);
    it('def p = {(1,);(2,);(3,)}', () => {
      return lc.query(dbname, 'def p = {(1,);(2,);(3,)}\ndef output = p', true, ['p']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert(setsEqual(new Set(res.result.actions[0].result.output[0].columns[0]), new Set([1,2,3])));
        assert(setsEqual(new Set(res.result.output[0].columns[0]), new Set([1,2,3])));
      });
    }).timeout(60000);
    it('def p = {(1, 5); (2, 7); (3, 9)}', () => {
      return lc.query(dbname, 'def p = {(1, 5); (2, 7); (3, 9)}\ndef output = p', true, ['p']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        let success = [];
        success = [[1,2,3],[5,7,9]].map((X,i) => {
          return setsEqual(new Set(X), new Set(res.result.actions[0].result.output[0].columns[i]));
        });
        assert.deepStrictEqual(success, [true, true]);
        success = [[1,2,3],[5,7,9]].map((X,i) => {
          return setsEqual(new Set(X), new Set(res.result.output[0].columns[i]));
        });
        assert.deepStrictEqual(success, [true, true]);
      });
    }).timeout(60000);
    it(`'ic {}' should give 422 error`, () => {
      return lc.query(dbname, 'ic {}').then(res => {
        assert.notStrictEqual(res.error, null);
        assert.strictEqual(res.error.status, 422);
        assert.notStrictEqual(res.result, null);
        assert.strictEqual(res.result.aborted, true);
        assert(res.result.problems.length > 0);
      });
    }).timeout(60000);
    it(`'def p =' should return problems`, () => {
      return lc.query(dbname, 'def p =', true, ['p']).then(res => {
        assert.strictEqual(res.error, null);
        assert(res.result.problems.length > 0);
      });
    }).timeout(60000);
  });

  describe('#query with update', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it(`should install insert 'def insert[:x] = 1' without error via an update query`, () => {
      return lc.query(dbname, 'def insert[:x] = 1', false).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it('should return 2 via incrementing x', () => {
      return lc.query(dbname, incrementQuery, false, [':x']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.output[0].columns[0][0], 2);
      });
    }).timeout(60000);
    it('should return 3 via incrementing x again', () => {
      return lc.query(dbname, incrementQuery, false, [':x']).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.output[0].columns[0][0], 3);
      });
    }).timeout(60000);
  });

  describe('#query with inputs', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    const queryString1 = 'def p2={10} def r=sum[p1*p2]';

    // Represents `def p = [1,2]`
    const inputs1 = [
      {
        "rel_key": {
          "values": [],
          "name": "p1",
          "keys": ["Int64"],
          "type": "RelKey"
        },
        "type": "Relation",
        "columns": [[1,2]]
      }
    ];

    const NOTEBOOK_RELATION = 'nb';
    const notebookName = 'myNotebook';
    const property = 'testProperty';
    const cellId = 'id_20';
    const initialValue = 'initial data value';
    const value = 'test data value';
    const queryString2 = `
      def previousValue = ${NOTEBOOK_RELATION}[query_notebook_name, :cells, query_cell_id, :${property}]
      def delete[:${NOTEBOOK_RELATION}] = (query_notebook_name, :cells, query_cell_id, :${property}, previousValue)
      def insert[:${NOTEBOOK_RELATION}] = (query_notebook_name, :cells, query_cell_id, :${property}, query_value)
    `;
    const queryString2Init = `def insert[:${NOTEBOOK_RELATION}] = ("${notebookName}", :cells, "${cellId}", :${property}, "${initialValue}")`;

    const inputs2 = [
      {
        rel_key: {
          values: ["DelveFixedSizeStrings.FixedSizeString{DelveFixedSizeStrings.Str128}"],
          name: 'query_cell_id',
          keys: [],
          type: 'RelKey',
        },
        type: 'Relation',
        columns: [[cellId]],
      },
      {
        rel_key: {
          values: ["DelveFixedSizeStrings.FixedSizeString{DelveFixedSizeStrings.Str128}"],
          name: 'query_value',
          keys: [],
          type: 'RelKey',
        },
        type: 'Relation',
        columns: [[value]],
      },
      {
        rel_key: {
          values: ["DelveFixedSizeStrings.FixedSizeString{DelveFixedSizeStrings.Str128}"],
          name: 'query_notebook_name',
          keys: [],
          type: 'RelKey',
        },
        type: 'Relation',
        columns: [[notebookName]],
      }
    ];

    it(`should query '${queryString1}' with input relationship 'def p1=[1,2]'`, () => {
      return lc.query(dbname, queryString1, true, ['r'], inputs1).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.output[0].columns[0][0], 30);
      });
    }).timeout(60000);
    it(`should insert "${queryString2Init}"`, () => {
      return lc.query(dbname, queryString2Init, false, [NOTEBOOK_RELATION]).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.output[0].columns.length, 3);
        // Ignore issues of order and stringify the JSON array, searching for the
        // string values we expect to find within the structure.
        const str = JSON.stringify(res.result.actions[0].result.output[0].columns);
        assert.notStrictEqual(-1, str.indexOf(notebookName));
        assert.notStrictEqual(-1, str.indexOf(cellId));
        assert.notStrictEqual(-1, str.indexOf(initialValue));
      });
    }).timeout(60000);
    it(`should query an update query with inputs`, () => {
      return lc.query(dbname, queryString2, false, [NOTEBOOK_RELATION], inputs2).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.output[0].columns.length, 3);
        // Ignore issues of order and stringify the JSON array, searching for the
        // string values we expect to find within the structure.
        const str = JSON.stringify(res.result.actions[0].result.output[0].columns);
        assert.notStrictEqual(-1, str.indexOf(notebookName));
        assert.notStrictEqual(-1, str.indexOf(cellId));
        assert.notStrictEqual(-1, str.indexOf(value));
      });
    }).timeout(60000);
  });

  describe('#cardinality', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it(`def cardinalityTest = {(1,); (2,); (3,)} should insert without error`, () => {
      return lc.query(dbname, 'def insert[:cardinalityTest] = {(1,); (2,); (3,)}', false).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it('should return cardinality 3', () => {
      return lc.cardinality(dbname, 'cardinalityTest').then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.actions[0].result.result[0].columns[0][0], 3);
      });
    }).timeout(60000);
  });

  describe('#listEdb', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it(`def foo = {(1,); (2,); (3,)} and def foo = 'Hi' should insert without error`, () => {
      return lc.query(dbname, `def insert[:foo] = {(1,); (2,); (3,)}\ndef insert[:foo] = "Hi"`, false).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`listEdb should return information on relation foo`, () => {
      return lc.listEdb(dbname, 'foo').then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.actions[0].result.rels.length, 2);
        assert.strictEqual(res.result.actions[0].result.rels[0].name, 'foo');
        assert.strictEqual(res.result.actions[0].result.rels[0].type, 'RelKey');
        assert.strictEqual(res.result.actions[0].result.rels[1].name, 'foo');
        assert.strictEqual(res.result.actions[0].result.rels[1].type, 'RelKey');
      });
    }).timeout(60000);
  });

  describe('#transaction version', () => {
    let trackedVersion = 0;
    const newDbName = createUniqueName('db');

    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it(`connects to database ${dbname} and the sdk sets the connection's transaction version`, () => {
      return lc.connectToDatabase(dbname).then(res => {
        assert.strictEqual(res.error, null);
        assert(res.result.version > 0);
        assert.strictEqual(lc.getTransactionVersion(dbname), res.result.version);
      });
    }).timeout(60000);
    it(`connects again to database ${dbname} using the current transaction version`, () => {
      const testVersion = lc.getTransactionVersion(dbname);
      return lc.connectToDatabase(dbname).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(lc.getTransactionVersion(dbname), testVersion);
        assert.strictEqual(res.result.version, testVersion);
      });
    }).timeout(60000);
    it(`inserts a new Map entry upon the creation of a new database`, () => {
      return lc.createDatabase(newDbName, true).then(res => {
        assert.strictEqual(res.error, null);
        trackedVersion = lc.getTransactionVersion(newDbName);
        assert(trackedVersion > 0);
      });
    }).timeout(60000);
    it(`connects to ${dbname}`, () => {
      return lc.connectToDatabase(dbname).then(res => {
        assert.strictEqual(res.error, null);
        assert(lc.getTransactionVersion(dbname) > 0);
      });
    }).timeout(60000);
    it(`connects to ${newDbName} and has transaction version ${trackedVersion}`, () => {
      return lc.connectToDatabase(newDbName).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(lc.getTransactionVersion(newDbName), trackedVersion);
      });
    }).timeout(60000);
    it(`properly fails to find a non-existing larger value version of ${dbname}`, () => {
      const testVersion = lc.getTransactionVersion(dbname) + 1;
      lc.setTransactionVersion(dbname, testVersion);
      return lc.connectToDatabase(dbname).then(res => {
        assert.notStrictEqual(res.error, null);
        assert.notStrictEqual(res.result, null);
        assert(res.result.problems.length > 0);
      });
    }).timeout(60000);
  });

  describe('#cloneDatabase', () => {
    const uniqueCloneName = createUniqueName('clone');

    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    it(`should install 'def foo = {(1,);(2,);(3,)}' without error into test-1.delve via #installSource`, () => {
      return lc.installSource(dbname, 'test-1.delve', 'def foo = {(1,);(2,);(3,)}').then(res => {
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.error, null);
      });
    }).timeout(60000);
    it(`should list test-1.delve in the result for #listSources`, () => {
      return lc.listSources(dbname).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.sources.length, defaultSources.length + 1);
        let match = false;
        for (let i = 0; i < (defaultSources.length + 1); i++) {
          if (res.result.actions[0].result.sources[i].name === 'test-1.delve') {
            match = true;
          }
        }
        assert(match);
      });
    }).timeout(60000);
    it(`should create ${uniqueCloneName} as a clone of ${dbname} without overwrite`, () => {
      return lc.cloneDatabase(uniqueCloneName, dbname, false).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`the clone should list test-1.delve in the result for #listSources`, () => {
      return lc.listSources(uniqueCloneName).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.sources.length, defaultSources.length + 1);
        let match = false;
        for (let i = 0; i < (defaultSources.length + 1); i++) {
          if (res.result.actions[0].result.sources[i].name === 'test-1.delve') {
            match = true;
          }
        }
        assert(match);
      });
    }).timeout(60000);
    it(`should fail to create ${uniqueCloneName} again as a clone of ${dbname} without overwrite`, () => {
      return lc.cloneDatabase(uniqueCloneName, dbname, false).then(res => {
        assert.notStrictEqual(res.error, null);
        assert.notStrictEqual(res.result, null);
        assert(res.result.problems.length > 0);
      });
    }).timeout(60000);
    it(`should create ${uniqueCloneName} again as a clone of ${dbname} with overwrite`, () => {
      return lc.cloneDatabase(uniqueCloneName, dbname, true).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`the clone should list test-1.delve in the result for #listSources`, () => {
      return lc.listSources(uniqueCloneName).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.strictEqual(res.result.actions[0].result.sources.length, defaultSources.length + 1);
        let match = false;
        for (let i = 0; i < (defaultSources.length + 1); i++) {
          if (res.result.actions[0].result.sources[i].name === 'test-1.delve') {
            match = true;
          }
        }
        assert(match);
      });
    }).timeout(60000);
  });

  describe('#loadJSON from data', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    const relname = 'people';
    const jsonString = JSON.stringify({
      name: {
        first: "William",
        last: "Shakespeare"
      },
      age: 100
    });

    const tempFileName = `${os.tmpdir()}/${dbname}.json`;

    it(`loads the JSON string, ${jsonString}`, () => {
      return lc.loadJSON(dbname, jsonString, null, relname).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`finds the relation that was loaded`, () => {
      return lc.query(dbname, `def output=${relname}`).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.notStrictEqual(res.result.output, null);
        assert.strictEqual(res.result.output.length, 3);
      });
    }).timeout(60000);
    it(`queries to export_json to ${tempFileName}`, () => {
      return lc.query(dbname, `def export=export_json[(:path, "${tempFileName}");(:data,${relname})]`).then(res => {
        assert.strictEqual(res.error, null);
      });
    }).timeout(60000);
    it(`loads the expected JSON from file ${tempFileName}`, () => {
      return fs.readFile(tempFileName, 'utf-8').then(result => {
        let json;
        try {
          json = JSON.parse(result);
        }
        catch(e) {
          assert.notStrictEqual('The loaded JSON does not parse', null);
        }
        const jsonInput = JSON.parse(jsonString);
        assert.strictEqual(json.name.first, jsonInput.name.first);
        assert.strictEqual(json.name.last, jsonInput.name.last);
        assert.strictEqual(json.age, jsonInput.age);
      });
    }).timeout(60000);
  });

  describe('#loadJSON from path', () => {
    const dbname = createUniqueName('db');
    initializeDatabase(dbname);

    const relname = 'people';
    const jsonString = JSON.stringify({
      name: {
        first: "William",
        last: "Shakespeare"
      },
      age: 100
    });

    const tempFileName = `${os.tmpdir()}/${dbname}.json`;
    const tempFileName1 = `${os.tmpdir()}/${dbname}1.json`;

    it(`writes the JSON string to temp file ${tempFileName}`, () => {
      return fs.writeFile(tempFileName, jsonString).then(() => {
        assert(true);
      }).catch(error => {
        assert.strictEqual(error, null);
      });
    }).timeout(60000);
    it(`loads the JSON file, ${tempFileName}`, () => {
      return lc.loadJSON(dbname, null, tempFileName, relname).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
      });
    }).timeout(60000);
    it(`finds the relation that was loaded`, () => {
      return lc.query(dbname, `def output=${relname}`).then(res => {
        assert.strictEqual(res.error, null);
        assert.strictEqual(res.result.problems.length, 0);
        assert.notStrictEqual(res.result.output, null);
        assert.strictEqual(res.result.output.length, 3);
      });
    }).timeout(60000);
    it(`queries to export_json to ${tempFileName1}`, () => {
      return lc.query(dbname, `def export=export_json[(:path, "${tempFileName1}");(:data,${relname})]`).then(res => {
        assert.strictEqual(res.error, null);
      });
    }).timeout(60000);
    it(`loads the expected JSON from file ${tempFileName1}`, () => {
      return fs.readFile(tempFileName1, 'utf-8').then(result => {
        let json;
        try {
          json = JSON.parse(result);
        }
        catch(e) {
          assert.notStrictEqual('The loaded JSON does not parse', null);
        }
        const jsonInput = JSON.parse(jsonString);
        assert.strictEqual(json.name.first, jsonInput.name.first);
        assert.strictEqual(json.name.last, jsonInput.name.last);
        assert.strictEqual(json.age, jsonInput.age);
      });
    }).timeout(60000);
  });
});
