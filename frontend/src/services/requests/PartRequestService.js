import { config } from '../../Settings';
import iRequestService from '../interfaces/iRequestService.ts';

/**
 * PartRequestService handles HTTP requests for Part components
 *
 * @extends iRequestService
 */
class PartRequestService extends iRequestService {
  constructor(props) {
    super(props);
    this.type = 'part';
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
    const url = `${this.baseUrl}/reticle/${batchType}/${batchId}/plates/${plateId}/parts/`;
    return iRequestService.makeRequest('GET', url);
  }

  /**
   * executes a PATCH request
   *
   * @param {string} batchType
   * @param {number} batchId
   * @param {number} plateId
   * @param {object} newObj
   * @public
   */
  async httpPatch(batchType, batchId, plateId, newObj) {
    const url = `${this.baseUrl}/reticle/${batchType}/${batchId}/plates/${plateId}/parts/`;
    return iRequestService.makeRequest('PATCH', url, newObj);
  }
}

export default PartRequestService;
