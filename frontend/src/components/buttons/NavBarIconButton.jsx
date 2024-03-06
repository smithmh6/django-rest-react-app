import React from 'react';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Link } from 'react-router-dom';

export default function NavBarButton(props) {
  const { imgSource, tooltipText, altText } = props;
  return (
    <OverlayTrigger
      placement="bottom"
      delay={{ show: 2500, hide: 0 }}
      overlay={
        <Tooltip id="button-tooltip-2" style={{ position: 'fixed' }}>
          {tooltipText}
        </Tooltip>
      }
    >
      {({ ref, ...triggerHandler }) => (
        <Button
          variant="outline-secondary"
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...triggerHandler}
          className="me-2"
        >
          <Link to={props.linkUrl}>
            <Image
              ref={ref}
              roundedCircle
              src={imgSource}
              width="25"
              height="25"
              alt={altText}
              className="d-inline-block align-middle"
            />
          </Link>
        </Button>
      )}
    </OverlayTrigger>
  );
}
