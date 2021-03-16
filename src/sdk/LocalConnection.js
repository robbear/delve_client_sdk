import ConnectionBase from './ConnectionBase.js';
import RelAPIMixin from './RelAPIMixin.js';

const Base = RelAPIMixin(ConnectionBase);

/**
 * Class representing a local connection to the Rel Server
 *
 * @inherits ConnectionBase
 * @mixes RelAPIMixin
 */
class LocalConnection extends Base {
  constructor(params) {
    super(params);
  }
}

export default LocalConnection;
