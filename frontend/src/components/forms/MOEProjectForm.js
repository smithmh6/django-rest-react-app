/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import withRouter from '../../common/withRouter';
import { config } from '../../Settings';
import RequestService from '../../services/requests/RequestService';

class MOEProjectForm extends Component {
  static contextType = MsalContext;

  static projectFields = {
    customer: 'Company*',
    name: 'Project Name*',
    quote_price: 'Quoted Price*',
    quote: 'Quote No.',
    quoted: 'Date Quoted',
    budget: 'Budget*',
    started: 'Date Started',
    delivery: 'Delivery Date*',
    invoice: 'Invoice No.',
    invoiced: 'Date Invoiced',
    po: 'PO No.',
  };

  static initialProjectForm = Object.entries(
    MOEProjectForm.projectFields
  ).reduce((obj, [field]) => ({ ...obj, [field]: '' }), {});

  static convertForm(form) {
    const cleanedEntries = Object.entries(form).filter(([, value]) => value);
    return Object.fromEntries(cleanedEntries);
  }

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      customers: null,
      projectForm: MOEProjectForm.initialProjectForm,
    };
    this.updateProjectForm = this.updateProjectForm.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.inputSelector = this.inputSelector.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async handleFormSubmit() {
    this.setState({ isFetching: true });
    const projectsUrl = `${config.url}api/purchasing/moe-projects/`;
    const formToSubmit = MOEProjectForm.convertForm(this.state.projectForm);

    try {
      await RequestService.makeRequest('POST', projectsUrl, formToSubmit);
      this.setState({
        projectForm: MOEProjectForm.initialProjectForm,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async fetchData() {
    this.setState({ isFetching: true });
    const customerUrl = `${config.url}api/purchasing/customers/`;

    try {
      const data = await RequestService.makeRequest('GET', customerUrl);
      this.setState({
        customers: data,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
      this.setState({ isFetching: false });
    }
  }

  updateProjectForm(e, field) {
    const { navigate } = this.props;

    if (field === 'customer' && e.target.value === 'add-customer') {
      navigate('/purchasing/add-customer');
      return;
    }

    this.setState((prevState) => ({
      projectForm: {
        ...prevState.projectForm,
        [field]: e.target.value,
      },
    }));
  }

  inputSelector(field, name) {
    if (field === 'customer') {
      return (
        <select
          value={this.state.projectForm[field]}
          onChange={(event) => this.updateProjectForm(event, field)}
        >
          <option value="">Select a Company</option>
          {this.state.customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
          <option value="add-customer">-- ADD NEW COMPANY --</option>
        </select>
      );
    }
    if (['quote_price', 'budget'].includes(field)) {
      return (
        <input
          className="text-input"
          type="number"
          value={this.state.projectForm[field]}
          onChange={(event) => this.updateProjectForm(event, field)}
          placeholder="0"
        />
      );
    }
    if (['quoted', 'started', 'delivery', 'invoiced'].includes(field)) {
      return (
        <input
          className="text-input"
          type="date"
          value={this.state.projectForm[field]}
          onChange={(event) => this.updateProjectForm(event, field)}
        />
      );
    }
    if (['quote', 'invoice'].includes(field)) {
      return (
        <input
          className="text-input"
          placeholder={name}
          value={this.state.projectForm[field]}
          onChange={(event) => this.updateProjectForm(event, field)}
        />
      );
    }
    return (
      <input
        className="text-input"
        value={this.state.projectForm[field]}
        onChange={(event) => this.updateProjectForm(event, field)}
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
              {Object.entries(MOEProjectForm.projectFields).map(
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

export default withRouter(MOEProjectForm);
