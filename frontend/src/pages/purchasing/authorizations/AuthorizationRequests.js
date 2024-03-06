/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Spinner, Button } from 'react-bootstrap';
import { config } from '../../../Settings';
import withRouter from '../../../common/withRouter';
import RequestService from '../../../services/requests/RequestService';
import DataTable from '../DataTable';
import purchaseRequestFields from '../PurchaseRequestFields';

class AuthorizationRequest extends Component {
  static contextType = MsalContext;

  constructor(props) {
    super(props);
    this.state = {
      authRequests: null,
      requestStatusItems: null,
      isFetching: false,
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
        RequestService.makeRequest('GET', `${baseUrl}authorization-requests/`),
        RequestService.makeRequest('GET', `${baseUrl}request-status/`),
      ]);

      this.setState({
        authRequests: data[0],
        requestStatusItems: data[1],
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
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
        this.props.navigate(`/purchases/authorizations/${obj.id}`);
      } else {
        e.stopPropagation();
      }
    }
  };

  handleSaveAuthRequests = async (event) => {
    // sends a PATCH request to update the list of open requests
    event.preventDefault();
    this.setState({ isFetching: true });

    const { authRequests } = this.state;

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'PATCH',
          `${baseUrl}authorization-requests/`,
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
            onClick={(event) => this.handleSaveAuthRequests(event)}
          >
            Save
          </Button>
        </div>
        <DataTable
          fields={purchaseRequestFields}
          data={this.state.authRequests}
          inputChangeFunction={this.handleInputChange}
          styleOverrides={{ maxHeight: '80vh' }}
          classNames={{ container: [], rows: ['clickable-row'], cells: [] }}
          rowClickFunction={this.handleRowclick}
        />
      </div>
    );
  }
}

export default withRouter(AuthorizationRequest);
