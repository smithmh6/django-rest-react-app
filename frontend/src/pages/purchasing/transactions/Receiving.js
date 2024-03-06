/* eslint-disable react/no-unused-state */
/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { config } from '../../../Settings';
import withRouter from '../../../common/withRouter';
import RequestService from '../../../services/requests/RequestService';
import DataTable from '../DataTable';
import HoverableButton from '../HoverableButton';
import ModalDialog from '../ModalDialog';
import purchaseItemFields from '../PurchaseItemFields';
import inputFactory from '../InputFactory';

class Receiving extends Component {
  static contextType = MsalContext;

  constructor(props) {
    super(props);
    this.state = {
      purchaseItems: null,
      statusItems: {
        itemStatusChoices: [],
        vendorChoices: [],
      },
      isFetching: false,
      filterForm: {},
      showDialog: false,
      dlgVariant: 'success',
      titleText: 'Success',
      btnPattern: null,
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
        RequestService.makeRequest('GET', `${baseUrl}purchased-items/`),
        RequestService.makeRequest('GET', `${baseUrl}item-status/`),
        RequestService.makeRequest('GET', `${baseUrl}vendors/`),
      ]);

      this.setState({
        purchaseItems: data[0],
        statusItems: {
          itemStatusChoices: data[1],
          vendorChoices: data[2],
        },
        isFetching: false,
        showFilters: false,
        filterForm: {},
      });
    } catch (error) {
      const errPayload = JSON.parse(error.message);
      this.setState({
        errors: errPayload.errors,
        showDialog: true,
        btnPattern: null,
        isFetching: false,
      });
    }
  };

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

  handleSaveItems = async (event) => {
    // sends a PATCH request to update the list of items
    event.preventDefault();
    this.setState({ isFetching: true, showDialog: false });

    const baseUrl = `${config.url}api/purchasing/`;

    const { purchaseItems } = this.state;

    try {
      const data = await Promise.all([
        RequestService.makeRequest(
          'PATCH',
          `${baseUrl}purchased-items/`,
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
        dlgVariant: 'success',
        titleText: 'Success',
        btnPattern: null,
        filterForm: {},
        showFilters: false,
      });
    } catch (error) {
      // const errPayload = JSON.parse(err.message);
      this.setState({
        errors: error.message,
        showDialog: true,
        btnPattern: null,
        isFetching: false,
      });
    }
  };

  handleFilterChange = (_obj, e) => {
    const { value, name } = e.target;
    if (['None', ''].includes(value) || value === null) {
      this.setState((prevState) => {
        const prevFilterForm = prevState.filterForm;
        delete prevFilterForm[name];
        return { filterForm: prevFilterForm };
      });
    } else {
      this.setState((prevState) => ({
        filterForm: { ...prevState.filterForm, [name]: value },
      }));
    }
  };

  applyFilters = async (event) => {
    event.preventDefault();

    this.setState({ isFetching: true });

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest('GET', `${baseUrl}purchased-items/`),
      ]);

      this.setState(
        (prevState) => ({
          purchaseItems: data[0].filter((item) => {
            let foundUsername = !Object.hasOwn(
              prevState.filterForm,
              'username'
            );
            let foundDescription = !Object.hasOwn(
              prevState.filterForm,
              'description'
            );
            let foundVendor = !Object.hasOwn(prevState.filterForm, 'vendor');
            let foundStatus = !Object.hasOwn(prevState.filterForm, 'status');
            if (Object.hasOwn(prevState.filterForm, 'description')) {
              foundDescription = item.description
                .toString()
                .toLowerCase()
                .includes(
                  prevState.filterForm.description.toString().toLowerCase()
                );
            }
            if (Object.hasOwn(prevState.filterForm, 'vendor')) {
              const vendorMatches = prevState.statusItems.vendorChoices.filter(
                (_vendor) => {
                  return _vendor.name
                    .toString()
                    .toLowerCase()
                    .includes(prevState.filterForm.vendor);
                }
              );
              const itemMatches = vendorMatches.filter((_vendor) => {
                return item.vendor === _vendor.code;
              });
              foundVendor = Object.keys(itemMatches).length > 0;
            }
            if (Object.hasOwn(prevState.filterForm, 'status')) {
              foundStatus = item.status === prevState.filterForm.status;
            }
            if (Object.hasOwn(prevState.filterForm, 'username')) {
              foundUsername = item.username
                .toString()
                .toLowerCase()
                .includes(
                  prevState.filterForm.username.toString().toLowerCase()
                );
            }
            return (
              foundDescription && foundVendor && foundStatus && foundUsername
            );
          }),
          showFilters: false,
          isFetching: false,
        }),
        () => this.checkFilterResults()
      );
    } catch (error) {
      const errPayload = JSON.parse(error.message);
      this.setState({
        errors: errPayload.errors,
        showDialog: true,
        btnPattern: null,
        isFetching: false,
      });
    }
  };

  checkFilterResults = () => {
    this.setState((prevState) => ({
      showDialog: prevState.purchaseItems.length === 0,
      messageText: 'No matching results found!',
      dlgVariant: 'warning',
      titleText: 'Warning',
      btnPattern: 'okClose',
    }));
  };

  clearFilters = async (event) => {
    event.preventDefault();

    this.setState({ isFetching: true });

    const baseUrl = `${config.url}api/purchasing/`;

    try {
      const data = await Promise.all([
        RequestService.makeRequest('GET', `${baseUrl}purchased-items/`),
      ]);

      this.setState({
        purchaseItems: data[0],
        isFetching: false,
        showFilters: false,
        filterForm: {},
      });
    } catch (error) {
      const errPayload = JSON.parse(error.message);
      this.setState({
        errors: errPayload.errors,
        showDialog: true,
        btnPattern: null,
        isFetching: false,
      });
    }
  };

  checkItemsReceived = async (event) => {
    event.preventDefault();

    const receivedItems = this.state.purchaseItems.filter((item) => {
      return item.status === 'RECV';
    });

    if (Object.keys(receivedItems).length > 0) {
      this.setState({
        showDialog: true,
        messageText: `${
          Object.keys(receivedItems).length
        } item(s) marked as received! Would you like to proceed?`,
        dlgVariant: 'warning',
        titleText: 'Attention!',
        btnPattern: 'okClose',
      });
    } else {
      this.handleSaveItems(event);
    }
  };

  render() {
    if (!this.state.isFetching) {
      purchaseItemFields.get('status').editable = true;
      if (this.state.statusItems.itemStatusChoices)
        purchaseItemFields.get('status').options.choices =
          this.state.statusItems.itemStatusChoices.filter(
            (choice) => !['CREATE'].includes(choice.code)
          );
      purchaseItemFields.get('vendor').options.choices =
        this.state.statusItems.vendorChoices;

      purchaseItemFields.get('url').control = 'url';
      purchaseItemFields.get('vendor').control = 'textinput';
      purchaseItemFields.get('vendor').options.placeholder = 'Vendor';
      purchaseItemFields.get('username').control = 'textinput';
      purchaseItemFields.get('username').options.placeholder = 'User';

      purchaseItemFields.get('description').editable = false;
      purchaseItemFields.get('product_no').editable = false;
      purchaseItemFields.get('package_size').editable = false;
      purchaseItemFields.get('min_order_qty').editable = false;
      purchaseItemFields.get('vendor').editable = false;
      purchaseItemFields.get('est_delivery').editable = true;

      purchaseItemFields.get('authorized').isVisible = false;
      purchaseItemFields.get('approved').isVisible = false;
      purchaseItemFields.get('group').isVisible = false;
      purchaseItemFields.get('category').isVisible = false;
      purchaseItemFields.get('project').isVisible = false;
      purchaseItemFields.get('min_order_qty').isVisible = false;
      purchaseItemFields.get('username').isVisible = true;
      purchaseItemFields.get('request_modified').isVisible = true;

      // set the fields we want to use as filters

      const filterFields = Array.from(purchaseItemFields).filter(([name]) => {
        return ['description', 'status', 'vendor', 'username'].includes(name);
      });

      const {
        errors,
        showDialog,
        messageText,
        titleText,
        dlgVariant,
        btnPattern,
      } = this.state;

      return (
        <div className="tsw-page">
          <div>
            <HoverableButton
              buttonText="Filters"
              tooltipText="Show the filter pane."
              onClickFunction={() => this.setState({ showFilters: true })}
            />
            <HoverableButton
              buttonText="Save"
              tooltipText="Save changes to purchase items."
              onClickFunction={this.checkItemsReceived}
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
          <Modal className="tsw-modal" show={this.state.showFilters} size="lg">
            <div className="tsw-form">
              <div className="form-header">Filters</div>
              <div className="form-body">
                <table>
                  <tbody className="form-body">
                    {filterFields.map(([name, attrs]) => (
                      <tr key={name}>
                        <td className="form-label">
                          <label htmlFor={name}>{attrs.display}</label>
                        </td>
                        <td className="form-input">
                          {inputFactory(
                            Object.hasOwn(this.state.filterForm, name)
                              ? this.state.filterForm
                              : null,
                            name,
                            { ...attrs, editable: true }, // make inputs in the filter form always editable
                            this.handleFilterChange
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="form-footer">
                <Button
                  variant="tsw-primary"
                  style={{ margin: '0.5em 0.5em' }}
                  onClick={(event) => this.clearFilters(event)}
                >
                  Clear
                </Button>
                <Button
                  variant="tsw-primary"
                  style={{ margin: '0.5em 0.5em' }}
                  onClick={(event) => this.applyFilters(event)}
                >
                  Apply
                </Button>
                <Button
                  variant="tsw-primary"
                  style={{ margin: '0.5em 0.5em' }}
                  onClick={() => this.setState({ showFilters: false })}
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
          <ModalDialog
            showDialog={showDialog}
            titleText={errors ? 'Error' : titleText}
            messageText={errors || messageText}
            onHideFunction={() => this.setState({ showDialog: false })}
            onOkFunction={this.handleSaveItems}
            variant={errors ? 'danger' : dlgVariant}
            buttonPattern={btnPattern}
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

export default withRouter(Receiving);
