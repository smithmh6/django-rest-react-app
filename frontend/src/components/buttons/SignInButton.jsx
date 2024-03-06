import React from 'react';
import { useMsal } from '@azure/msal-react';
import Button from 'react-bootstrap/Button';
import { loginRequest } from '../../authConfig';

/**
 * Renders a button which, when selected, will open a popup for login
 */
export default function SignInButton() {
  const { instance } = useMsal();

  const handleLogin = (loginType) => {
    if (loginType === 'popup') {
      instance.loginPopup(loginRequest).catch((error) => {
        console.error(error);
      });
    }
  };
  return (
    <Button
      variant="primary"
      className="my-auto"
      type="submit"
      size="lg"
      onClick={() => handleLogin('popup')}
      style={{
        width: '360px',
        height: '90px',
        fontSize: '24px',
      }}
    >
      <img
        src="/microsoft-logo.png"
        width="50"
        height="50"
        alt="Thorlabs Inc Logo"
        className="d-inline-block align-middle me-2"
      />{' '}
      Sign In with Microsoft
    </Button>
  );
}
