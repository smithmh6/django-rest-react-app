import React from 'react';
import withRouter from '../../common/withRouter';

// Button to navigate to maintenance
function MaintenanceButton({ navigate }) {
  return (
    <button
      className="btn"
      type="button"
      onClick={() => navigate('/request-maintenance/')}
    >
      Maintenance / Requests
    </button>
  );
}

export default withRouter(MaintenanceButton);
