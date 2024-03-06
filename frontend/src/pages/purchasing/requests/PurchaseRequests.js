import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { config } from '../../../Settings';
import withRouter from '../../../common/withRouter';
import RequestService from '../../../services/requests/RequestService';
import purchaseRequestFields from '../PurchaseRequestFields';
import PurchaseRequestListView from './PurchaseRequestListView';
import ModalForm from '../ModalForm';

class PurchaseRequests extends Component {
  static contextType = MsalContext;

  constructor(props) {
    super(props);
    this.state = {
      purchaseRequests: null,
      requestStatusItems: null,
      isFetching: false,
      isFormVisible: false,
      requestFormData: {},
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params !== prevProps.params) {
      this.fetchData();
    }
  }

  handleRowClick = (obj, e) => {
    if (Object.hasOwn(e, 'target')) {
      const { target } = e;
      if (target.tagName === 'TD') {
        this.props.navigate(`/purchases/requests/${obj.id}`);
      } else {
        e.stopPropagation();
      }
    }
  };

  handleRequestFormInputChange = (_obj, e) => {
    const { value, name } = e.target;
    if (value === 'None') {
      this.setState((prevState) => {
        const prevRequestFormData = prevState.requestFormData;
        delete prevRequestFormData[name];
        return { requestFormData: prevRequestFormData };
      });
    } else {
      this.setState((prevState) => ({
        requestFormData: { ...prevState.requestFormData, [name]: value },
      }));
    }
  };

  handleCreatePurchaseRequest = async (event) => {
    event.preventDefault();
    this.setState({ isFetching: true });

    const { requestFormData } = this.state;

    const baseUrl = `${config.url}api/purchasing/`;
    console.log(`${baseUrl}user-requests/`);

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'POST',
          `${baseUrl}user-requests/`,
          requestFormData
        ),
      ]);

      this.setState({
        purchaseRequests: data[0],
        isFetching: false,
        isFormVisible: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  handleInputChange = (obj, e) => {
    const { value, name } = e.target;
    this.setState((prevState) => ({
      purchaseRequests: prevState.purchaseRequests.map((item) =>
        item.id === obj.id
          ? {
              ...item,
              [name]: value === '' ? null : value,
            }
          : item
      ),
    }));
  };

  handleSavePurchaseRequests = async (event) => {
    // sends a PATCH request to update the list of open requests
    event.preventDefault();
    this.setState({ isFetching: true });

    const { purchaseRequests } = this.state;

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'PATCH',
          `${baseUrl}user-requests/`,
          purchaseRequests
        ),
      ]);

      this.setState({
        purchaseRequests: data[0],
        isFetching: false,
        isFormVisible: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  fetchData = async () => {
    this.setState({ isFetching: true });

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest('GET', `${baseUrl}user-requests/`),
        RequestService.makeRequest('GET', `${baseUrl}request-status/`),
      ]);

      this.setState({
        purchaseRequests: data[0],
        requestStatusItems: data[1],
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    purchaseRequestFields.get('status').options.choices =
      this.state.requestStatusItems;

    return (
      <>
        <PurchaseRequestListView
          tableData={{
            fields: purchaseRequestFields,
            data: this.state.purchaseRequests,
            styleOverrides: { maxHeight: '80vh' },
            classNames: { container: [], rows: ['clickable-row'], cells: [] },
          }}
          onNewPurchaseRequestClick={() =>
            this.setState({ isFormVisible: true })
          }
          onSaveRequestsFunction={this.handleSavePurchaseRequests}
          isFetching={this.state.isFetching}
          inputChangeFunction={this.handleInputChange}
          rowClickFunction={this.handleRowClick}
        />
        <ModalForm
          formTitle="New Purchase Request"
          fields={purchaseRequestFields}
          formData={this.state.requestFormData}
          isVisible={this.state.isFormVisible}
          onHideFunction={() => {
            this.setState({ isFormVisible: false });
          }}
          inputChangeFunction={this.handleRequestFormInputChange}
          onSubmitFunction={this.handleCreatePurchaseRequest}
        />
      </>
    );
  }
}

export default withRouter(PurchaseRequests);
