import { config } from '../../Settings';
import iRequestService from '../interfaces/iRequestService.ts';

/**
 * FabNoteRequestService handles HTTP requests for FabNote components
 *
 * @extends iRequestService
 */
class FabNoteRequestService extends iRequestService {
  constructor(props) {
    super(props);
    this.type = 'fabNote';
    this.baseUrl = `${config.url}api/reporting/general-notes/`;
  }

  /**
   * executes a GET request
   *
   * @public
   */
  async httpGet() {
    // GET to this endpoint returns a single-item array
    return (await iRequestService.makeRequest('GET', this.baseUrl))[0];
  }

  /**
   * executes a PUT request
   *
   * @param {object} newObj
   * @public
   */
  async httpPut(newObj) {
    return iRequestService.makeRequest('PUT', this.baseUrl, newObj);
  }
}

export default FabNoteRequestService;
