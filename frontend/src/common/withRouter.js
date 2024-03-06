import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const withRouter = (WrappedComponent) =>
  function Wrap(props) {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    return (
      <WrappedComponent
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        params={params}
        location={location}
        navigate={navigate}
      />
    );
  };

export default withRouter;
