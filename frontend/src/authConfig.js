// MSAL -- authentication settings
import * as msal from '@azure/msal-browser';

const msalDevelopment = {
  auth: {
    clientId: '4ce85893-410b-4ac6-8d0d-be3bda44c3a7',
    authority:
      'https://login.microsoftonline.com/41151004-4224-448a-a787-d4279c1f087d', // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

const msalProduction = {
  auth: {
    clientId: '4ce85893-410b-4ac6-8d0d-be3bda44c3a7',
    authority:
      'https://login.microsoftonline.com/41151004-4224-448a-a787-d4279c1f087d', // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: 'https://tsw-web.azurewebsites.net/.auth/login/aad/callback',
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

export const msalConfig =
  process.env.REACT_APP_Mode === 'development'
    ? msalDevelopment
    : msalProduction;

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ['User.Read'],
};

// This should be the same instance you pass to MsalProvider
export const msalInstance = new msal.PublicClientApplication(msalConfig);
await msalInstance.initialize();

export const acquireAccessToken = async () => {
  const activeAccount = msalInstance.getActiveAccount(); // This will only return a non-null value if you have logic somewhere else that calls the setActiveAccount API
  const accounts = msalInstance.getAllAccounts();

  if (!activeAccount && accounts.length === 0) {
    /*
     * User is not signed in. Throw error or wait for user to login.
     * Do not attempt to log a user in outside of the context of MsalProvider
     */
  }
  const request = {
    scopes: ['User.Read'],
    account: activeAccount || accounts[0],
  };

  try {
    // console.log('Fetching token silently');
    const authResult = await msalInstance.acquireTokenSilent(request);
    return authResult.accessToken;
  } catch (silentError) {
    try {
      console.log(
        `Silent fetch failed, attempting popup request. (${silentError.toString()})`
      );
      return await msalInstance.acquireTokenPopup(request);
    } catch (popupError) {
      console.error('Failed to fetch token.', popupError);
      return null;
    }
  }
};
