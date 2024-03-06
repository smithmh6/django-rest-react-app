import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';

import TwoColumnForm from './TwoColumnForm';

/*
Required Props:
- inputData, an obj mapping fields to input data objects
    - contains information such as input type (and options if applicable),
      label names, and default options
- serivce, an obj with a callable .post() to send form data to
Optional Props:
- title, a string for the form title.
- convertForm, which will be called to convert form data prior to submission
- callWithData, a callback that will be called after data is received.
*/

class ControlledModalForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: this.getInitialValues(),
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setState((prevState) => {
        return {
          values: { ...prevState.values, ...this.getDefaultValues() },
        };
      });
    }
  }

  getDefaultValues = () => {
    const inputArray = Object.entries(this.props.inputData);
    const filtered = inputArray.filter(([, obj]) => 'defaultValue' in obj);
    const defaults = filtered.map(([field, obj]) => [field, obj.defaultValue]);
    return Object.fromEntries(defaults);
  };

  // Sets default state according to input data
  getInitialValues = () => {
    const inputArray = Object.entries(this.props.inputData);
    const defaults = inputArray.map(([field, obj]) => {
      const defaultValue = obj.inputType === 'checkbox' ? false : '';
      return [field, obj.defaultValue ?? defaultValue];
    });
    return Object.fromEntries(defaults);
  };

  updateField = (field, value) => {
    this.setState((prevState) => ({
      values: { ...prevState.values, [field]: value },
    }));
  };

  render() {
    return (
      <Modal className="tsw-modal" show={this.props.showModal} size="lg">
        <TwoColumnForm
          inputData={this.props.inputData}
          values={this.state.values}
          handleValueChange={this.updateField}
          handleSubmit={() => this.props.handleSubmit(this.state.values)}
          title={this.props.title}
          isSubmitting={this.props.isSubmitting}
        />
        <Button
          className="back-button"
          type="button"
          variant="danger"
          onClick={this.props.handleBack}
        >
          Back
        </Button>
      </Modal>
    );
  }
}

export default ControlledModalForm;
