import { config } from '../../Settings';
import iRequestService from '../interfaces/iRequestService.ts';

/**
 * BatchRequestService handles HTTP requests for Batch components
 *
 * @extends iRequestService
 */
class BatchRequestService extends iRequestService {
  constructor(props) {
    super(props);
    this.type = 'batch';
    this.baseUrl = `${config.url}api/batches`;
  }

  /**
   * executes a GET request
   *
   * @param {string} batchType
   * @param {number} batchId
   * @public
   */
  async httpGet(batchType, batchId) {
    const url = `${this.baseUrl}/reticle/${batchType}/${batchId}/`;
    return iRequestService.makeRequest('GET', url);
  }

  /**
   * executes a POST request
   *
   * @param {string} batchType
   * @param {object} newObj
   * @public
   */
  async httpPost(batchType, newObj) {
    const url =
      batchType === 'textured_ar'
        ? `${this.baseUrl}/${batchType}/`
        : `${this.baseUrl}/reticle/${batchType}/`;

    return iRequestService.makeRequest('POST', url, newObj);
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
    const url =
      batchType === 'textured_ar'
        ? `${this.baseUrl}/${batchType}/${batchId}/`
        : `${this.baseUrl}/reticle/${batchType}/${batchId}/`;

    return iRequestService.makeRequest('PATCH', url, newObj);
  }

  /**
   * executes a GET request which queries for all open batches
   *
   * @param {string} batchType
   * @public
   */
  async getAllBatches(batchType) {
    const url =
      batchType === 'textured_ar'
        ? `${this.baseUrl}/${batchType}/`
        : `${this.baseUrl}/reticle/${batchType}/`;

    return iRequestService.makeRequest('GET', url);
  }
}

export default BatchRequestService;
