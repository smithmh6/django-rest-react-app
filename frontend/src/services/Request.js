import { config } from '../Settings';
import { acquireAccessToken } from '../authConfig';

export async function makeRequest(method, endpoint, body) {
  const url = `${config.url}api${endpoint}`;
  // Attempt token acquisition
  let token;
  try {
    token = await acquireAccessToken();
  } catch (error) {
    console.error('Error obtaining token');
    throw error;
  }

  // Check that data methods include a body
  const isDataMethod = ['POST', 'PUT', 'PATCH'].includes(method);

  if (isDataMethod && !body) {
    throw new Error(`No body data provided for request method ${method}`);
  }

  // Construct headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `${token}`);

  const options = {
    method,
    headers,
    mode: 'cors',
  };

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

  // Throw error if response is not OK
  if (!response.ok) {
    const consoleMessage = `Bad Network Response. \n${response.status} ${response.statusText} ${response.url}`;
    console.error(consoleMessage);

    const data = await response.json();
    throw new Error(data.message ?? JSON.stringify(data));
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error('Unable to read response JSON');
  }
  return data;
}

export async function makeHandledRequest(method, endpoint, body) {
  try {
    return await makeRequest(method, endpoint, body);
  } catch (error) {
    return error;
  }
}

export async function mockRequest(data, secs = 1) {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve(data);
      },
      Math.random() * (secs * 1000)
    );
  });
}
