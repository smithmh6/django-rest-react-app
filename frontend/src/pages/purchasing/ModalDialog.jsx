import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

export default function ModalDialog({
  showDialog,
  titleText,
  messageText,
  onHideFunction,
  onOkFunction,
  variant,
  buttonPattern,
}) {
  const getIconType = () => {
    if (variant === 'success') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          className="bi bi-info-circle"
          viewBox="0 0 18 18"
          style={{ marginRight: '10px' }}
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
        </svg>
      );
    }
    if (['warning', 'danger'].includes(variant)) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          className="bi bi-exclamation-circle"
          viewBox="0 0 18 18"
          style={{ marginRight: '10px' }}
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
        </svg>
      );
    }

    return null;
  };

  const renderButtons = () => {
    if (buttonPattern === 'okClose')
      return (
        <>
          <Button
            variant="tsw-primary"
            style={{ margin: '0.5em 0.5em' }}
            onClick={onOkFunction ? (event) => onOkFunction(event) : undefined}
          >
            Ok
          </Button>
          <Button
            variant="tsw-primary"
            style={{ margin: '0.5em 0.5em' }}
            onClick={() => onHideFunction()}
          >
            Close
          </Button>
        </>
      );
    return (
      <Button
        variant="tsw-primary"
        style={{ margin: '0.5em 0.5em' }}
        onClick={() => onHideFunction()}
      >
        Close
      </Button>
    );
  };
  return (
    <Modal
      size="lg"
      show={showDialog}
      className="tsw-modal"
      aria-labelledby="contained-modal-title-vcenter"
    >
      <div className="tsw-form">
        <div className="form-header">{titleText}</div>
        <div className="form-body">
          <Alert variant={variant}>
            {getIconType()}
            {messageText}
          </Alert>
        </div>
        <div className="form-footer">{renderButtons()}</div>
      </div>
    </Modal>
  );
}
