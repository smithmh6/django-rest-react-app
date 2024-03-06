/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import withRouter from '../../common/withRouter';
import { config } from '../../Settings';
import RequestService from '../../services/requests/RequestService';

class CustomerForm extends Component {
  static contextType = MsalContext;

  static customerFields = {
    name: 'Company*',
    street1: 'Street (1)*',
    street2: 'Street (2)',
    city: 'City*',
    state: 'State*',
    zip_code: 'Zip Code*',
    country: 'Country*',
    email: 'Email',
    contact: 'Contact',
    phone: 'Phone Number',
  };

  static initialCustomerForm = Object.entries(
    CustomerForm.customerFields
  ).reduce((obj, [field]) => ({ ...obj, [field]: '' }), {});

  // Removes empty fields so that the backend
  // won't insert them as blank fields
  static convertForm(form) {
    const cleanedEntries = Object.entries(form).filter(([, value]) => value);
    return Object.fromEntries(cleanedEntries);
  }

  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      customerForm: CustomerForm.initialCustomerForm,
    };
    this.updateCustomerForm = this.updateCustomerForm.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.inputSelector = this.inputSelector.bind(this);
  }

  async handleFormSubmit() {
    this.setState({ isFetching: true });
    const customerUrl = `${config.url}api/purchasing/customers/`;
    const formToSubmit = CustomerForm.convertForm(this.state.customerForm);

    try {
      await RequestService.makeRequest('POST', customerUrl, formToSubmit);
      this.setState({
        customerForm: CustomerForm.initialCustomerForm,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  updateCustomerForm(e, field) {
    this.setState((prevState) => ({
      customerForm: {
        ...prevState.customerForm,
        [field]: e.target.value,
      },
    }));
  }

  inputSelector(field, name) {
    return (
      <input
        className="text-input"
        value={this.state.customerForm[field]}
        onChange={(event) => this.updateCustomerForm(event, field)}
        placeholder={name}
      />
    );
  }

  render() {
    if (this.state.isFetching)
      return <div id="loader" className="lds-dual-ring overlay" />;

    return (
      <div className="table-wrapper">
        <div className="table-container moe-project-form">
          <table id="moeProjectFormTable">
            <tbody>
              {Object.entries(CustomerForm.customerFields).map(
                ([field, name]) => (
                  <tr key={field}>
                    <th>{name}</th>
                    <td>{this.inputSelector(field, name)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div>
          <button type="submit" className="btn" onClick={this.handleFormSubmit}>
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(CustomerForm);
