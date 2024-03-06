/* eslint-disable lines-between-class-members */
import { acquireAccessToken } from '../../authConfig';

/**
 * Abstract base class (interface) for Request Services
 *
 * @constructor
 * @abstract
 */
abstract class iRequestService {
  type: null | undefined;
  baseUrl: null | undefined;

  constructor() {
    if (this.constructor === iRequestService) {
      throw new Error(
        'Cannot instantiate abstract base class iRequestService!'
      );
    }
  }

  static async makeRequest(method: string, url: string, body: object) {
    // Attempt token acquisition
    let token;
    try {
      token = await acquireAccessToken();
    } catch (error) {
      console.error('Error obtaining token');
      throw error;
    }

    // Construct headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `${token}`);

    // eslint-disable-next-line no-undef
    const options: RequestInit = {
      method,
      mode: 'cors',
      headers,
    };

    // Check that data methods include a body
    const isDataMethod = ['POST', 'PUT', 'PATCH'].includes(
      method.toUpperCase()
    );

    if (isDataMethod && !body) {
      throw new Error(`No body data provided for request method ${method}`);
    }

    // Attatch body if data method
    const metadata = isDataMethod
      ? { ...options, body: JSON.stringify(body) }
      : options;

    let response;

    // Attempt to fetch URL with request data
    try {
      response = await fetch(url, metadata);
    } catch (error) {
      console.error('Error in call to fetch()');
      throw error;
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Unable to read JSON response.');
    }

    // Throw error if response is not OK
    if (!response.ok) {
      const errorMessage = {
        status: response.status,
        text: response.statusText,
        url: response.url,
        errors: data.errors,
      };
      throw new Error(JSON.stringify(errorMessage));
    }

    return data;
  }

  abstract httpGet(): Promise<any>;

  abstract httpPost(): Promise<any>;

  abstract httpPut(): Promise<any>;

  abstract httpPatch(): Promise<any>;
}

export default iRequestService;
