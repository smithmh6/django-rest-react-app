/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Button, Spinner } from 'react-bootstrap';
import { config } from '../../../Settings';
import withRouter from '../../../common/withRouter';
import RequestService from '../../../services/requests/RequestService';
import purchaseRequestFields from '../PurchaseRequestFields';
import DataTable from '../DataTable';

class ApprovalRequest extends Component {
  static contextType = MsalContext;

  constructor(props) {
    super(props);
    this.state = {
      approvalRequests: null,
      requestStatusItems: null,
      isFetching: false,
      errors: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ isFetching: true });

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest('GET', `${baseUrl}approval-requests/`),
        RequestService.makeRequest('GET', `${baseUrl}request-status/`),
      ]);

      this.setState({
        approvalRequests: data[0],
        requestStatusItems: data[1],
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
      const errPayload = JSON.parse(error.message);
      this.setState({ isFetching: false, errors: errPayload.errors });
    }
  };

  handleInputChange = (obj, e) => {
    const { value, name } = e.target;
    this.setState((prevState) => ({
      authRequests: prevState.authRequests.map((item) =>
        item.id === obj.id
          ? {
              ...item,
              [name]: value === '' ? null : value,
            }
          : item
      ),
    }));
  };

  handleRowclick = (obj, e) => {
    if (Object.hasOwn(e, 'target')) {
      const { target } = e;
      if (target.tagName === 'TD') {
        this.props.navigate(`/purchases/approvals/${obj.id}`);
      } else {
        e.stopPropagation();
      }
    }
  };

  handleSaveApprovalRequests = async (event) => {
    // sends a PATCH request to update the list of open requests
    event.preventDefault();
    this.setState({ isFetching: true });

    const { authRequests } = this.state;

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'PATCH',
          `${baseUrl}approval-requests/`,
          authRequests
        ),
      ]);

      this.setState({
        authRequests: data[0],
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    if (this.state.requestStatusItems)
      purchaseRequestFields.get('status').options.choices =
        this.state.requestStatusItems;

    return this.state.isFetching ? (
      <div className="tsw-page">
        <Spinner animation="border" variant="danger" />
      </div>
    ) : (
      <div className="tsw-page">
        <div>
          <Button
            style={{ margin: '5px 5px 5px 5px' }}
            variant="tsw-primary"
            onClick={(event) => this.handleSaveApprovalRequests(event)}
          >
            Save
          </Button>
        </div>
        <DataTable
          fields={purchaseRequestFields}
          data={this.state.approvalRequests}
          inputChangeFunction={this.handleInputChange}
          styleOverrides={{ maxHeight: '80vh' }}
          classNames={{ container: [], rows: ['clickable-row'], cells: [] }}
          rowClickFunction={this.handleRowclick}
        />
      </div>
    );
  }
}

export default withRouter(ApprovalRequest);
