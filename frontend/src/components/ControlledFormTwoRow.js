import React, { Component } from 'react';
import TwoRowForm from './TwoRowForm';

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

class ControlledForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: this.getInitialValues(),
    };
  }

  // Sets default state according to input data
  getInitialValues = () => {
    const inputArray = Object.entries(this.props.inputData);
    const defaults = inputArray.map(([field, obj]) => [
      field,
      obj.defaultValue ?? '',
    ]);
    return Object.fromEntries(defaults);
  };

  updateField = (field, value) => {
    this.setState((prevState) => ({
      values: { ...prevState.values, [field]: value },
    }));
  };

  render() {
    return (
      <TwoRowForm
        inputData={this.props.inputData}
        values={this.state.values}
        handleValueChange={this.updateField}
        handleSubmit={() => this.props.handleSubmit(this.state.values)}
        title={this.props.title}
      />
    );
  }
}

export default ControlledForm;
