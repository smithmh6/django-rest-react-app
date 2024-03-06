import { config } from '../../Settings';
import iRequestService from '../interfaces/iRequestService.ts';

/**
 * FacilityRequestService handles HTTP requests for Facility components
 *
 * @extends iRequestService
 */
class FacilityRequestService extends iRequestService {
  constructor(props) {
    super(props);
    this.type = 'facility';
    this.baseUrl = `${config.url}api/facility/plots`;
  }

  /**
   * executes a GET request
   *
   * @param {string} plotType
   * @public
   */
  async httpGet(plotType) {
    const plotUrl = `${this.baseUrl}/${plotType}/`;
    const gasUrl = `${this.baseUrl}/gas/`;
    const requests = [iRequestService.makeRequest('GET', plotUrl)];

    // if plot_type == water, get data from two endpoints
    // TcChiller and GasPcw tables both have water data
    if (plotType === 'water') {
      requests.push(iRequestService.makeRequest('GET', gasUrl));
    }

    return Promise.all(requests);
  }
}

export default FacilityRequestService;
