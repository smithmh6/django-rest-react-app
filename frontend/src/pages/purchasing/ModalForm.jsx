/* eslint-disable no-underscore-dangle */
import React from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';
import inputFactory from './InputFactory';

export default function ModalForm({
  formTitle,
  fields,
  formData,
  isVisible,
  onHideFunction,
  inputChangeFunction,
  onSubmitFunction,
  errors,
}) {
  let fieldsArr = Array.from(fields);

  // filter out fields for controls only
  fieldsArr = fieldsArr.filter(([, attrs]) => Object.hasOwn(attrs, 'control'));

  fieldsArr = fieldsArr.filter(([, attrs]) => {
    return Object.hasOwn(attrs, 'onCreate') ? attrs.onCreate : true;
  });

  const getDataObject = (_name) => {
    if (formData) return Object.hasOwn(formData, _name) ? formData : null;
    return null;
  };

  const getErrorMessage = (_name, _attrs) => {
    if (errors)
      return Object.hasOwn(errors, _name) ? (
        <Alert variant="warning">
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
          {`${_attrs.display} - ${errors[_name]}`}
        </Alert>
      ) : null;

    return null;
  };

  return (
    <Modal
      className="tsw-modal"
      show={isVisible}
      onHide={onHideFunction ? () => onHideFunction() : undefined}
      size="lg"
    >
      <div className="tsw-form">
        <div className="form-header">{formTitle}</div>
        <div className="form-body">
          <table>
            <tbody className="form-body">
              {fieldsArr.map(([name, attrs]) => (
                <tr key={name}>
                  <td className="form-label">
                    <label htmlFor={name}>{attrs.display}</label>
                  </td>
                  <td className="form-input">
                    {getErrorMessage(name, attrs)}
                    {inputFactory(
                      getDataObject(name),
                      name,
                      attrs,
                      inputChangeFunction
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-footer">
          <Button
            variant="tsw-primary"
            onClick={(event) => onSubmitFunction(event)}
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
