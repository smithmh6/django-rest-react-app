import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function HoverableButton({
  buttonText,
  tooltipText,
  onClickFunction,
  isDisabled,
}) {
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
          style={{ margin: '5px 5px 5px 5px' }}
          variant="tsw-primary"
          onClick={(event) => onClickFunction(event)}
          disabled={isDisabled}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...triggerHandler}
        >
          {buttonText}
        </Button>
      )}
    </OverlayTrigger>
  );
}
