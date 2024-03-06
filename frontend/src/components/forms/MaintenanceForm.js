import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import withRouter from '../../common/withRouter';
import { config } from '../../Settings';
import { columns } from '../../common/Constants';
import RequestService from '../../services/requests/RequestService';
import '../../css/Tables.css';
import '../../css/Forms.css';

class MaintenanceForm extends Component {
  static contextType = MsalContext;

  initialFormState = {
    priority: 'LOW',
  };

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      requests: null,
      formData: this.initialFormState,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ isFetching: true });
    const url = `${config.url}api/maintenance-requests/`;

    try {
      const data = await RequestService.makeRequest('GET', url);

      // Clear ID field from data
      // and convert data to be more readable
      data.forEach((maintenanceRequest) => {
        const reference = maintenanceRequest; // reference variable to avoid mutating arguments
        reference.created = new Date(reference.created).toLocaleDateString();
      });

      this.setState({
        requests: data,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
      this.setState({
        isFetching: false,
      });
    }
  };

  handleInputChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  validateFormData = () => {
    const { formData } = this.state;

    if (!formData.title) {
      alert('Title field is required.');
      return false;
    }
    if (formData.title.length > 100) {
      alert('Title cannot be longer than 100 characters.');
      return false;
    }
    return true;
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    if (!this.validateFormData()) return;
    this.setState({ isFetching: true });

    try {
      const { formData } = this.state;
      // TODO: figure out how to setup email w/ form data
      // TODO: get debug information
      // TODO: handle form validation
      const url = `${config.url}api/maintenance-requests/`;
      const data = await RequestService.makeRequest('POST', url, formData);
      data.created = new Date(data.created).toLocaleDateString();

      this.setState((prevState) => ({
        formData: this.initialFormState,
        isFetching: false,
        requests: [...prevState.requests, data],
      }));
    } catch (error) {
      this.setState({ isFetching: false });
      console.error(error);
      alert(error.message);
    }
  };

  render() {
    if (this.state.isFetching)
      return <div id="loader" className="lds-dual-ring overlay" />;

    if (this.state.requests === undefined) {
      return <h1>Failed to fetch requests</h1>;
    }

    return (
      <div id="maintenance-page" className="tsw-old">
        <div id="maintenance-form" className="table-container">
          <table>
            <tbody>
              <tr>
                <th colSpan="2">
                  <h2>Submit a Request</h2>
                </th>
              </tr>
              <tr>
                <td>
                  <label htmlFor="request-title">Title*</label>
                </td>
                <td>
                  <input
                    id="request-title"
                    type="text"
                    name="title"
                    className="text-input"
                    value={this.state.formData.title ?? ''}
                    onChange={this.handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="request-description">Description</label>
                </td>
                <td>
                  <textarea
                    id="request-description"
                    name="description"
                    className="text-input"
                    rows="4"
                    cols="100"
                    value={this.state.formData.description ?? ''}
                    onChange={this.handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="request-category">Category</label>
                </td>
                <td>
                  <input
                    id="request-category"
                    name="category"
                    type="text"
                    className="text-input"
                    value={this.state.formData.category ?? ''}
                    onChange={this.handleInputChange}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label htmlFor="request-priority">Priority*</label>
                </td>
                <td>
                  <select
                    id="request-priority"
                    name="priority"
                    onChange={this.handleInputChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <button
                    type="submit"
                    className="btn"
                    onClick={this.handleSubmit}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div id="maintenance-table" className="table-container batch-list">
          {this.state.requests.length ? (
            <>
              <h2> Open Maintenance Requests</h2>
              <table>
                <tbody>
                  <tr>
                    {Object.entries(columns.maintenanceForm).map(
                      ([field, displayName]) => (
                        <th key={field}>{displayName}</th>
                      )
                    )}
                  </tr>
                  {this.state.requests.map((r) => (
                    <tr key={r.id}>
                      {Object.entries(r).map((entry) => (
                        <td key={entry[0]}>{entry[1]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <h1>No open requests to show.</h1>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(MaintenanceForm);
