import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Spinner } from 'react-bootstrap';
import { config } from '../../../Settings';
import withRouter from '../../../common/withRouter';
import RequestService from '../../../services/requests/RequestService';
import DataTable from '../DataTable';
import ModalForm from '../ModalForm';
import HoverableButton from '../HoverableButton';
import purchaseItemFields from '../PurchaseItemFields';
import ModalDialog from '../ModalDialog';

function setNotEditable(value, key, map) {
  // eslint-disable-next-line no-param-reassign
  map.get(key).editable = false;
}

class PurchaseRequestDetail extends Component {
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
      isFormVisible: false,
      itemFormData: {},
      errors: null,
      showDialog: false,
      messageText: null,
    };
  }

  componentDidMount() {
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

  handleFormInputChange = (_obj, e) => {
    const { value, name } = e.target;
    if (['None', ''].includes(value) || value === null) {
      this.setState((prevState) => {
        const prevItemFormData = prevState.itemFormData;
        delete prevItemFormData[name];
        return { itemFormData: prevItemFormData };
      });
    } else {
      this.setState((prevState) => ({
        itemFormData: { ...prevState.itemFormData, [name]: value },
      }));
    }
  };

  onHideModalForm = () => {
    this.setState({ isFormVisible: false });
  };

  handleCreateItem = async (event) => {
    event.preventDefault();
    this.setState({ isFetching: true });

    const purchaseRequestId = this.props.params.id;

    const { itemFormData } = this.state;

    // calculate total cost on submission
    const itemData = {
      ...itemFormData,
      total: Number(itemFormData.cost * itemFormData.qty).toFixed(2),
    };

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'POST',
          `${PurchaseRequestDetail.baseUrl}request/${purchaseRequestId}/items/`,
          itemData
        ),
      ]);

      this.setState({
        purchaseItems: data[0],
        isFetching: false,
        isFormVisible: false,
        errors: null,
      });
    } catch (error) {
      // on POST request, creation errors are handled by ModalForm
      const errPayload = JSON.parse(error.message);
      this.setState({
        isFetching: false,
        errors: errPayload.errors,
      });
    }
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
          `${PurchaseRequestDetail.baseUrl}request/${purchaseRequestId}/items/`,
          purchaseItems
        ),
      ]);

      this.setState({
        purchaseItems: data[0],
        isFetching: false,
        isFormVisible: false,
        showDialog: true,
        errors: null,
        messageText: 'Your items have been saved!',
      });
    } catch (error) {
      const errPayload = JSON.parse(error.message);
      this.setState({
        errors: errPayload.errors,
        showDialog: true,
        isFetching: false,
      });
    }
  };

  handleSendRequest = (event) => {
    // changes PurchaseRequest.status code to --> Authorization ('AUTH')
    event.preventDefault();

    this.setState(
      (prevState) => ({
        purchaseRequest: [{ ...prevState.purchaseRequest[0], status: 'AUTH' }],
      }),
      () => this.updatePurchaseRequest()
    );
  };

  handleSubmitRequest = (event) => {
    // changes PurchaseRequest.status code to --> Submitted ('SUBMIT')
    // updates all approved items to status --> Requestes ('REQ')
    event.preventDefault();

    this.setState(
      (prevState) => ({
        purchaseRequest: [
          { ...prevState.purchaseRequest[0], status: 'SUBMIT' },
        ],
        purchaseItems: prevState.purchaseItems.map((item) => ({
          ...item,
          status: item.approved === 'APPR' ? 'REQ' : item.status,
        })),
      }),
      () => this.updatePurchaseRequest()
    );
  };

  handleCancelRequest = (event) => {
    // changes PurchaseRequest.status code to --> Cancelled ('CANCEL')
    event.preventDefault();

    this.setState(
      // NOTE: Pop Up a dialog here asking the user if they really want to cancel!!!
      (prevState) => ({
        purchaseRequest: [
          { ...prevState.purchaseRequest[0], status: 'CANCEL' },
        ],
      }),
      () => this.updatePurchaseRequest()
    );
  };

  updatePurchaseRequest = async () => {
    // make PATCH to update PurchaseRequest Status
    this.setState({ isFetching: true });

    const { purchaseRequest, purchaseItems } = this.state;

    const purchaseRequestId = this.props.params.id;

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'PATCH',
          `${baseUrl}requests/${purchaseRequestId}/`,
          purchaseRequest
        ),
        RequestService.makeRequest(
          'PATCH',
          `${PurchaseRequestDetail.baseUrl}request/${purchaseRequestId}/items/`,
          purchaseItems
        ),
      ]);

      let msgType = 'saved!';
      if (purchaseRequest[0].status === 'SUBMIT') msgType = 'submitted!';
      if (purchaseRequest[0].status === 'CANCEL') msgType = 'cancelled!';
      if (purchaseRequest[0].status === 'AUTH')
        msgType = 'sent to authorization!';

      this.setState({
        purchaseRequest: data[0],
        purchaseItems: data[1],
        isFetching: false,
        errors: null,
        showDialog: true,
        messageText: `Your request has been ${msgType}`,
      });

      // show modal here
    } catch (error) {
      const errPayload = JSON.parse(error.message);
      this.setState({
        errors: errPayload.errors,
        showDialog: true,
        isFetching: false,
      });
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
      const errPayload = JSON.parse(error.message);
      this.setState({
        errors: errPayload.errors,
        showDialog: true,
        isFetching: false,
      });
    }
  };

  canAddItem = () => {
    let isStatusAuth = false;
    if (this.state.purchaseRequest) {
      const requestStatus = this.state.purchaseRequest[0].status;
      if (
        ['AUTH', 'APPR', 'APPROVED', 'SUBMIT', 'COMPLETE'].includes(
          requestStatus
        )
      ) {
        // NOTE: move this call into render() so it gets executed once
        purchaseItemFields.forEach(setNotEditable);
        isStatusAuth = true;
      }
    }
    return isStatusAuth;
  };

  canSaveItems = () => {
    return this.canAddItem();
  };

  canSendRequest = () => {
    return this.canAddItem();
  };

  canSubmitRequest = () => {
    let isStatusApproved = false;
    if (this.state.purchaseRequest) {
      const requestStatus = this.state.purchaseRequest[0].status;
      if (['APPROVED'].includes(requestStatus)) {
        purchaseItemFields.forEach(setNotEditable);
        isStatusApproved = true;
      }
    }
    return !isStatusApproved;
  };

  canCancelRequest = () => {
    let isStatusCompleted = false;
    if (this.state.purchaseRequest) {
      const requestStatus = this.state.purchaseRequest[0].status;
      if (['COMPLETE'].includes(requestStatus)) {
        purchaseItemFields.forEach(setNotEditable);
        isStatusCompleted = true;
      }
    }
    return isStatusCompleted;
  };

  onHideDialog = () => {
    this.setState({ showDialog: false });
  };

  render() {
    const approvedField = purchaseItemFields.get('approved');
    const authorizedField = purchaseItemFields.get('authorized');

    // set approved and authorized to always editable==false
    approvedField.editable = false;
    authorizedField.editable = false;

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

    // change url to 'url' field if items not editable
    if (this.canAddItem()) purchaseItemFields.get('url').control = 'url';

    // PurchaseRequestDetailView.jsx
    if (!this.state.isFetching) {
      const {
        errors,
        messageText,
        isFormVisible,
        itemFormData,
        purchaseItems,
        showDialog,
      } = this.state;

      // NOTE: Need to invert all of the boolean functions
      //        for isDisabled to make them more clear and reusable.
      return (
        <div style={{ textAlign: 'center', margin: '10px 10px 10px 10px' }}>
          <div>
            <HoverableButton
              buttonText="Add Item"
              tooltipText="Add a new item to the current purchase request."
              onClickFunction={() => this.setState({ isFormVisible: true })}
              isDisabled={this.canAddItem()}
            />
            <HoverableButton
              buttonText="Save"
              tooltipText="Save any changes made the current items."
              onClickFunction={this.handleSaveItems}
              isDisabled={this.canSaveItems()}
            />
            <HoverableButton
              buttonText="Send"
              tooltipText="Send the request for authorization."
              onClickFunction={this.handleSendRequest}
              isDisabled={this.canSendRequest()}
            />
            <HoverableButton
              buttonText="Submit"
              tooltipText="Submit the request to be purchased."
              onClickFunction={this.handleSubmitRequest}
              isDisabled={this.canSubmitRequest()}
            />
            <HoverableButton
              buttonText="Cancel"
              tooltipText="Cancel the purchase request."
              onClickFunction={this.handleCancelRequest}
              isDisabled={this.canCancelRequest()}
            />
          </div>
          <DataTable
            fields={purchaseItemFields}
            data={purchaseItems}
            inputChangeFunction={this.handleInputChange}
            // styleOverrides={{ fontSize: '.5em' }}
            classNames={{ container: ['purchasing'], rows: ['hoverable-row'] }}
            // rowClickFunction={rowClickFunction}
          />
          <ModalForm
            formTitle="Add Item"
            fields={purchaseItemFields}
            formData={itemFormData}
            isVisible={isFormVisible}
            onHideFunction={this.onHideModalForm}
            inputChangeFunction={this.handleFormInputChange}
            onSubmitFunction={this.handleCreateItem}
            errors={errors}
          />
          <ModalDialog
            showDialog={showDialog}
            titleText={errors ? 'Error' : 'Success'}
            messageText={errors || messageText}
            onHideFunction={this.onHideDialog}
            variant={errors ? 'danger' : 'success'}
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

export default withRouter(PurchaseRequestDetail);
