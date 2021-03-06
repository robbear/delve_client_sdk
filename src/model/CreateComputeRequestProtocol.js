/**
 * RAI Cloud SDK
 * This is a Client SDK for RAI Cloud
 *
 * The version of the OpenAPI document: 1.4.0
 * Contact: support@relational.ai
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

import ApiClient from '../ApiClient';

/**
 * The CreateComputeRequestProtocol model module.
 * @module model/CreateComputeRequestProtocol
 * @version 1.4.0
 */
class CreateComputeRequestProtocol {
    /**
     * Constructs a new <code>CreateComputeRequestProtocol</code>.
     * @alias module:model/CreateComputeRequestProtocol
     */
    constructor() { 
        
        CreateComputeRequestProtocol.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>CreateComputeRequestProtocol</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/CreateComputeRequestProtocol} obj Optional instance to populate.
     * @return {module:model/CreateComputeRequestProtocol} The populated <code>CreateComputeRequestProtocol</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new CreateComputeRequestProtocol();

            if (data.hasOwnProperty('region')) {
                obj['region'] = ApiClient.convertToType(data['region'], 'String');
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = ApiClient.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('size')) {
                obj['size'] = ApiClient.convertToType(data['size'], 'String');
            }
            if (data.hasOwnProperty('dryrun')) {
                obj['dryrun'] = ApiClient.convertToType(data['dryrun'], 'Boolean');
            }
        }
        return obj;
    }


}

/**
 * @member {String} region
 */
CreateComputeRequestProtocol.prototype['region'] = undefined;

/**
 * @member {String} name
 */
CreateComputeRequestProtocol.prototype['name'] = undefined;

/**
 * @member {String} size
 */
CreateComputeRequestProtocol.prototype['size'] = undefined;

/**
 * @member {Boolean} dryrun
 */
CreateComputeRequestProtocol.prototype['dryrun'] = undefined;






export default CreateComputeRequestProtocol;

