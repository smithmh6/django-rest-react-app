/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Spinner } from 'react-bootstrap';
import { config } from '../../../Settings';
import withRouter from '../../../common/withRouter';
import RequestService from '../../../services/requests/RequestService';
import DataTable from '../DataTable';
import HoverableButton from '../HoverableButton';
import purchaseItemFields from '../PurchaseItemFields';

class AuthorizationRequestDetail extends Component {
  static contextType = MsalContext;

  static baseUrl = `${config.url}api/purchasing/`;

  constructor(props) {
    super(props);
    this.state = {
      purchaseRequest: null,
      purchaseItems: null,
      statusItems: {
        approvalStatusChoices: [],
        itemStatusChoices: [],
        groupChoices: [],
        categoryChoices: [],
        projectChoices: [],
        vendorChoices: [],
      },
      isFetching: false,
    };
  }

  componentDidMount() {
    // NOTE: why does this fire when on a different route?
    if (this.props.params.id) this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params !== this.props.params) this.fetchData();
  }

  handleInputChange = (obj, e) => {
    const { value, name } = e.target;

    const calculateTotalCost = () => {
      if (name === 'cost') return Number(value * obj.qty).toFixed(2);
      if (name === 'qty') return Number(value * obj.cost).toFixed(2);
      return Number(obj.total).toFixed(2);
    };

    this.setState((prevState) => ({
      purchaseItems: prevState.purchaseItems.map((item) =>
        item.id === obj.id
          ? {
              ...item,
              [name]: value === '' ? null : value,
              total: calculateTotalCost(),
            }
          : item
      ),
    }));
  };

  handleAuthorizeAll = (event) => {
    event.preventDefault();

    // set state update purchase items status
    this.setState(
      (prevState) => ({
        purchaseItems: prevState.purchaseItems.map((item) => ({
          ...item,
          authorized: 'APPR',
        })),
      }),
      () => this.handleSaveItems(event)
    );
  };

  handleSaveItems = async (event) => {
    // sends a PATCH request to update the list of items
    event.preventDefault();
    this.setState({ isFetching: true });

    const { purchaseItems } = this.state;
    const purchaseRequestId = this.props.params.id;

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'PATCH',
          `${AuthorizationRequestDetail.baseUrl}request/${purchaseRequestId}/items/`,
          purchaseItems
        ),
      ]);

      this.setState({
        purchaseItems: data[0],
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  handleUpdateAuthStatus = (event) => {
    // changes PurchaseRequest status to 'APPR'
    // then calls handleCompleteAuthorization
    event.preventDefault();

    this.setState(
      (prevState) => ({
        purchaseRequest: [{ ...prevState.purchaseRequest[0], status: 'APPR' }],
      }),
      () => this.handleCompleteAuthorization(event)
    );
  };

  handleCompleteAuthorization = async (event) => {
    // sends a PATCH request to update the list of items
    // and the PurchaseRequest.. These can be 2 separate
    // API calls because the Item status does not depend
    // on the PurchaseRequest status
    event.preventDefault();
    this.setState({ isFetching: true });

    const { purchaseItems, purchaseRequest } = this.state;
    const purchaseRequestId = this.props.params.id;

    try {
      const data = await Promise.all([
        // Send PATCH to update items
        RequestService.makeRequest(
          'PATCH',
          `${AuthorizationRequestDetail.baseUrl}request/${purchaseRequestId}/items/`,
          purchaseItems
        ),
        // Send PATCH to update PurchaseRequest
        RequestService.makeRequest(
          'PATCH',
          `${AuthorizationRequestDetail.baseUrl}requests/${purchaseRequestId}/`,
          purchaseRequest
        ),
      ]);

      this.setState(
        {
          purchaseItems: data[0],
          purchaseRequest: data[1],
        },
        () => this.props.navigate(`/purchases/authorization-requests/`)
      );
    } catch (error) {
      console.error(error);
    }
  };

  fetchData = async () => {
    this.setState({ isFetching: true });

    const purchaseRequestId = this.props.params.id;

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'GET',
          `${baseUrl}requests/${purchaseRequestId}/`
        ),
        RequestService.makeRequest(
          'GET',
          `${baseUrl}request/${purchaseRequestId}/items/`
        ),
        RequestService.makeRequest('GET', `${baseUrl}approval-status/`),
        RequestService.makeRequest('GET', `${baseUrl}item-status/`),
        RequestService.makeRequest('GET', `${baseUrl}groups/`),
        RequestService.makeRequest('GET', `${baseUrl}categories/`),
        RequestService.makeRequest('GET', `${baseUrl}projects/`),
        RequestService.makeRequest('GET', `${baseUrl}vendors/`),
      ]);

      this.setState({
        purchaseRequest: data[0],
        purchaseItems: data[1],
        statusItems: {
          approvalStatusChoices: data[2],
          itemStatusChoices: data[3],
          groupChoices: data[4],
          categoryChoices: data[5],
          projectChoices: data[6],
          vendorChoices: data[7],
        },
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const approvedField = purchaseItemFields.get('approved');
    const authorizedField = purchaseItemFields.get('authorized');

    // set approved and authorized to always editable==false
    approvedField.editable = false;
    authorizedField.editable = true;

    // set the choice options for each select input
    approvedField.options.choices =
      this.state.statusItems.approvalStatusChoices;
    authorizedField.options.choices =
      this.state.statusItems.approvalStatusChoices;
    purchaseItemFields.get('status').options.choices =
      this.state.statusItems.itemStatusChoices;
    purchaseItemFields.get('group').options.choices =
      this.state.statusItems.groupChoices;
    purchaseItemFields.get('category').options.choices =
      this.state.statusItems.categoryChoices;
    purchaseItemFields.get('project').options.choices =
      this.state.statusItems.projectChoices;
    purchaseItemFields.get('vendor').options.choices =
      this.state.statusItems.vendorChoices;

    // PurchaseRequestDetailView.jsx
    if (!this.state.isFetching) {
      return (
        <div style={{ textAlign: 'center', margin: '10px 10px 10px 10px' }}>
          <div>
            <HoverableButton
              buttonText="Authorize All"
              tooltipText="Authorize all items in the request."
              onClickFunction={this.handleAuthorizeAll}
            />
            <HoverableButton
              buttonText="Save"
              tooltipText="Save any changes made the current items."
              onClickFunction={this.handleSaveItems}
            />
            <HoverableButton
              buttonText="Complete"
              tooltipText="Complete the authorization and send for final approval."
              onClickFunction={this.handleUpdateAuthStatus}
            />
          </div>
          <DataTable
            fields={purchaseItemFields}
            data={this.state.purchaseItems}
            inputChangeFunction={this.handleInputChange}
            // styleOverrides={{ fontSize: '.5em' }}
            classNames={{ container: ['purchasing'], rows: ['hoverable-row'] }}
            // rowClickFunction={rowClickFunction}
          />
        </div>
      );
    }
    return (
      <div className="tsw-page">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }
}

export default withRouter(AuthorizationRequestDetail);
