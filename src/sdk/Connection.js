import ConnectionBase from './ConnectionBase.js';
import RelAPIMixin from './RelAPIMixin.js';

const Base = RelAPIMixin(ConnectionBase);

/**
 * Class representing a connection to the Rel Server
 *
 * @inherits ConnectionBase
 * @mixes RelAPIMixin
 */
class Connection extends Base {
  constructor(params) {
    super(params);
  }
}

export default Connection;
