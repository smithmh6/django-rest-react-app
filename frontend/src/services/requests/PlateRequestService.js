import { config } from '../../Settings';
import iRequestService from '../interfaces/iRequestService.ts';

/**
 * PlateRequestService handles HTTP requests for Plate components
 *
 * @extends iRequestService
 */
class PlateRequestService extends iRequestService {
  constructor(props) {
    super(props);
    this.type = 'plate';
    this.baseUrl = `${config.url}api/batches`;
  }

  /**
   * executes a GET request
   *
   * @param {string} batchType
   * @param {number} batchId
   * @param {number} plateId
   * @public
   */
  async httpGet(batchType, batchId, plateId) {
    const url = `${this.baseUrl}/reticle/${batchType}/${batchId}/plates/${plateId}/`;
    return iRequestService.makeRequest('GET', url);
  }

  /**
   * executes a PATCH request
   *
   * @param {string} batchType
   * @param {number} batchId
   * @param {object} newObj
   * @public
   */
  async httpPatch(batchType, batchId, newObj) {
    const url = `${this.baseUrl}/reticle/${batchType}/${batchId}/plates/`;
    return iRequestService.makeRequest('PATCH', url, newObj);
  }
}

export default PlateRequestService;
