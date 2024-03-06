import React from 'react';
import { useMsal } from '@azure/msal-react';
import Button from 'react-bootstrap/Button';

/**
 * Renders a button which, when selected, will redirect the page to the logout prompt
 */
export default function SignOutButton() {
  const { instance } = useMsal();

  const handleLogout = (logoutType) => {
    if (logoutType === 'redirect') {
      instance.logoutRedirect({
        postLogoutRedirectUri: '/',
      });
    }
  };

  return (
    <Button
      variant="danger"
      className="me-2"
      type="submit"
      onClick={() => handleLogout('redirect')}
    >
      Sign Out
    </Button>
  );
}
