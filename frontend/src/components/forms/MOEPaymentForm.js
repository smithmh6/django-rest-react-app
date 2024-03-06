/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import withRouter from '../../common/withRouter';
import { config } from '../../Settings';
import RequestService from '../../services/requests/RequestService';

class MOEPaymentForm extends Component {
  static contextType = MsalContext;

  static paymentFields = {
    project: 'Project Name*',
    paid: 'Date Paid*',
    amount: 'Amount Paid*',
  };

  static initialPaymentForm = Object.entries(
    MOEPaymentForm.paymentFields
  ).reduce((obj, [field]) => ({ ...obj, [field]: '' }), {});

  static convertForm(form) {
    const cleanedEntries = Object.entries(form).filter(([, value]) => value);
    return Object.fromEntries(cleanedEntries);
  }

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      projects: null,
      paymentForm: MOEPaymentForm.initialPaymentForm,
    };
    this.updatePaymentForm = this.updatePaymentForm.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.inputSelector = this.inputSelector.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  async handleFormSubmit() {
    this.setState({ isFetching: true });
    const paymentsUrl = `${config.url}api/purchasing/moe-payments/`;
    const formToSubmit = MOEPaymentForm.convertForm(this.state.paymentForm);

    try {
      await RequestService.makeRequest('POST', paymentsUrl, formToSubmit);
      this.setState({
        paymentForm: MOEPaymentForm.initialPaymentForm,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async fetchData() {
    this.setState({ isFetching: true });
    const projectUrl = `${config.url}api/purchasing/moe-projects/`;

    try {
      const data = await RequestService.makeRequest('GET', projectUrl);
      this.setState({
        projects: data,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
      this.setState({ isFetching: false });
    }
  }

  updatePaymentForm(e, field) {
    this.setState((prevState) => ({
      paymentForm: {
        ...prevState.paymentForm,
        [field]: e.target.value,
      },
    }));
  }

  inputSelector(field, name) {
    if (field === 'project') {
      return (
        <select
          value={this.state.paymentForm[field]}
          onChange={(event) => this.updatePaymentForm(event, field)}
        >
          <option value="">Select a Project</option>
          {this.state.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      );
    }
    if (field === 'paid') {
      return (
        <input
          className="text-input"
          type="date"
          value={this.state.paymentForm[field]}
          onChange={(event) => this.updatePaymentForm(event, field)}
        />
      );
    }
    if (field === 'amount') {
      return (
        <input
          className="text-input"
          type="number"
          value={this.state.paymentForm[field]}
          onChange={(event) => this.updatePaymentForm(event, field)}
          placeholder="0"
        />
      );
    }
    return (
      <input
        className="text-input"
        value={this.state.paymentForm[field]}
        onChange={(event) => this.updatePaymentForm(event, field)}
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
              {Object.entries(MOEPaymentForm.paymentFields).map(
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

export default withRouter(MOEPaymentForm);
