/* eslint-disable camelcase */
// eslint-disable-next-line max-classes-per-file
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Alert, Button } from 'react-bootstrap';
import withRouter from '../../common/withRouter';
import DataTable from '../../components/DataTable';
import {
  CommonSKUService,
  ReticleSkuService,
  ShipmentService,
  ShippingStatusService,
  TARFailcodesService,
  TARSkuService,
  TARStepService,
  WarehouseService,
} from '../../services/Services';
import TwoRowForm from '../../components/TwoRowForm';

const withSelectOneOption = (options) => [
  { value: '', text: '--- Select One ---' },
  ...options,
];

class ShipmentCreate extends Component {
  static contextType = MsalContext;

  static rttSkuOptions = [{ text: 'FP', value: '179' }];

  static tarSkuOptions = [
    { text: 'OC', value: '126' },
    { text: 'FP', value: '124' },
  ];

  static skuFormInputData = {
    partType: {
      label: 'Part Type',
      inputType: 'select',
      options: ['TAR', 'RTT'],
      defaultValue: 'TAR',
    },
    item_content_type: {
      label: 'SKU Type',
      inputType: 'select',
      options: this.tarSkuOptions,
      defaultValue: this.tarSkuOptions[0].value,
    },
    item_object_id: {
      label: 'SKU Name',
      inputType: 'select',
      options: ['Loading...'],
    },
    qty: { label: 'Quantity', inputType: 'number' },
    destination_object_id: {
      label: 'Warehouse',
      inputType: 'select',
      options: ['Loading...'],
    },
    status: {
      label: 'Status',
      inputType: 'select',
      options: ['Loading...'],
      defaultValue: 'PENDING',
    },
    transfer: { label: 'Transfer No.', size: 10 },
    tracking: { label: 'Tracking No.', size: 10 },
    final: { label: 'Final Order', size: 10 },
  };

  static skuDisplayTableHeaders = {
    name: 'Name',
    location: 'Location',
    description: 'Description',
    stock_min: 'Stock Min',
    cost: 'Cost',
    active: 'Active',
    special: 'Special',
    notes: 'Notes',
  };

  static tarPartListTableHeaders = {
    id: 'ID',
    serial: 'Serial No.',
    step_object_id: 'Step No.',
    act_time: 'ACT',
    fail1_object_id: 'Fail',
    notes: 'Notes',
  };

  static reticlePartListTableHeaders = {
    serial: 'Serial No.',
    index: 'Index',
    step: 'Step',
    plate: 'Plate ID',
    notes: 'Notes',
  };

  static convertForm = (form) => {
    const formArr = Object.entries(form);
    const trimmedForm = Object.fromEntries(
      formArr.filter(([, value]) => value !== '')
    );

    trimmedForm.destination_content_type = 158;

    return trimmedForm;
  };

  static getInitialValues = () => {
    const inputArray = Object.entries(this.skuFormInputData);
    const defaults = inputArray.map(([field, obj]) => [
      field,
      obj.defaultValue ?? '',
    ]);
    return Object.fromEntries(defaults);
  };

  static infoAlert = (message) => {
    return (
      <Alert variant="info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          className="bi bi-info-circle"
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
        </svg>
        {message}
      </Alert>
    );
  };

  static createBooleanCell = (data, field) => {
    return <td key={field}>{data[field] ? 'Yes' : 'No'}</td>;
  };

  constructor(props) {
    super(props);
    this.state = {
      shipmentForm: ShipmentCreate.getInitialValues(),
      selectedParts: new Set(),
    };

    this.shipmentCreateInputData = ShipmentCreate.skuFormInputData;
    this.partListTableHeaders = ShipmentCreate.tarPartListTableHeaders;
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const [
      ocSkusTAR,
      fpSkusTAR,
      stepsTAR,
      failcodesTAR,
      fpSkusRTT,
      warehouses,
      statuses,
    ] = await Promise.all([
      TARSkuService.getOpticalCoat(),
      TARSkuService.getFinalProduct(),
      TARStepService.get(),
      TARFailcodesService.get(),
      ReticleSkuService.getFinalProduct(),
      WarehouseService.get(),
      ShippingStatusService.get(),
    ]);

    const selectedContentType = this.state.shipmentForm.item_content_type;
    const currentSkus = {
      126: ocSkusTAR,
      124: fpSkusTAR,
      179: fpSkusRTT,
    }[selectedContentType];

    if (!(currentSkus instanceof Error)) {
      const loadedSkuData = currentSkus.map((sku) => ({
        text: sku.name,
        value: sku.id,
      }));
      this.shipmentCreateInputData.item_object_id.options =
        withSelectOneOption(loadedSkuData);
    }

    if (!(warehouses instanceof Error)) {
      this.shipmentCreateInputData.destination_object_id.options =
        withSelectOneOption(
          warehouses.map(({ id, name }) => ({
            text: name,
            value: id,
          }))
        );
    }

    if (!(statuses instanceof Error)) {
      this.shipmentCreateInputData.status.options = statuses.map(
        ({ name, code }) => ({
          text: name,
          value: code,
        })
      );
    }

    this.setState({
      ocSkusTAR,
      fpSkusTAR,
      stepsTAR,
      failcodesTAR,
      fpSkusRTT,
    });
  };

  searchParts = async () => {
    const { item_content_type, item_object_id, partType } =
      this.state.shipmentForm;
    this.setState({ parts: null, currentSku: null, selectedParts: new Set() });

    // TODO: Simplify switching logic
    if (partType === 'TAR') {
      this.partListTableHeaders = ShipmentCreate.tarPartListTableHeaders;
    }
    if (partType === 'RTT') {
      this.partListTableHeaders = ShipmentCreate.reticlePartListTableHeaders;
    }

    const [parts, currentSku] = await Promise.all([
      CommonSKUService.getShippableParts(item_content_type, item_object_id),
      CommonSKUService.getByContentType(item_content_type, item_object_id),
    ]);
    this.setState({ parts, currentSku });
  };

  updateShipmentForm = (field, value) => {
    if (field === 'item_content_type') {
      const { ocSkusTAR, fpSkusTAR, fpSkusRTT } = this.state;
      const currentSkus = {
        126: ocSkusTAR,
        124: fpSkusTAR,
        179: fpSkusRTT,
      }[value];
      if (currentSkus) {
        const loadedSkuData = currentSkus.map((sku) => ({
          text: sku.name,
          value: sku.id,
        }));
        this.shipmentCreateInputData.item_object_id.options =
          withSelectOneOption(loadedSkuData);
      }
    }

    this.setState((prevState) => {
      return { shipmentForm: { ...prevState.shipmentForm, [field]: value } };
    });

    if (field === 'partType') {
      if (value === 'TAR') {
        this.shipmentCreateInputData.item_content_type.options =
          ShipmentCreate.tarSkuOptions;
        this.updateShipmentForm(
          'item_content_type',
          ShipmentCreate.tarSkuOptions[0].value
        );
      }
      if (value === 'RTT') {
        this.shipmentCreateInputData.item_content_type.options =
          ShipmentCreate.rttSkuOptions;
        this.updateShipmentForm(
          'item_content_type',
          ShipmentCreate.rttSkuOptions[0].value
        );
      }
    }
  };

  togglePartSelection = (id) => {
    this.setState((prevState) => {
      const newSet = prevState.selectedParts;
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedParts: newSet };
    });
  };

  autoselectParts = () => {
    const availableQuantity = this.state.parts.length;
    const requiredQty = this.state.shipmentForm.qty;
    if (requiredQty > availableQuantity) {
      alert(
        `Not enough parts available. (${availableQuantity}/${requiredQty})`
      );
      return;
    }
    if (!requiredQty) {
      alert('Please enter a valid quantity');
      return;
    }
    this.setState((prevState) => {
      const arrCopy = [...prevState.parts];
      arrCopy.splice(requiredQty);
      const newSet = new Set(arrCopy.map((part) => part.id));
      return { selectedParts: newSet };
    });
  };

  createShipment = async () => {
    const selectedQty = this.state.selectedParts.size;
    const requiredQty = Number(this.state.shipmentForm.qty);
    if (selectedQty !== requiredQty) {
      if (
        !window.confirm(
          `Specified ${requiredQty} parts, but ${selectedQty} are selected. Continue?`
        )
      )
        return;
    }
    const shipmentForm = ShipmentCreate.convertForm(this.state.shipmentForm);
    const shipmentToSend = {
      ...shipmentForm,
      parts: Array.from(this.state.selectedParts),
    };
    this.setState({
      parts: null,
    });
    const newShipment = await ShipmentService.create(shipmentToSend);
    if (!(newShipment instanceof Error)) this.props.navigate('/shipments/');
    this.setState({ parts: newShipment });
  };

  createStepCell = (part) => {
    const { stepsTAR } = this.state;
    const { step_object_id } = part;

    const defaultCell = <td key="step_object_id">Step {step_object_id}</td>;
    if (!stepsTAR) return defaultCell;

    const step = stepsTAR.find(({ id }) => id === step_object_id);
    if (!step) return defaultCell;

    return <td key="step_object_id">{step.name}</td>;
  };

  createPartFailCell = (part) => {
    const { failcodesTAR } = this.state;
    const { fail1_object_id } = part;

    if (fail1_object_id === null) {
      return <td key="fail1_object_id">None</td>;
    }

    const fallbackCell = (
      <td key="fail1_object_id">Failcode {fail1_object_id}</td>
    );

    if (!failcodesTAR) return fallbackCell;

    const failcode = failcodesTAR.find(({ id }) => id === fail1_object_id);

    if (!failcode) return fallbackCell;

    return <td key="fail1_object_id">{failcode.name}</td>;
  };

  render() {
    return (
      <div className="tsw-page shipment-creation">
        <div className="horizontal-wrapper shipment-form-section">
          <TwoRowForm
            inputData={this.shipmentCreateInputData}
            values={this.state.shipmentForm}
            handleValueChange={this.updateShipmentForm}
            handleSubmit={this.searchParts}
            disableSubmit={
              !this.state.ocSkusTAR ||
              this.state.shipmentForm.item_object_id === ''
            }
          />
        </div>
        <hr />
        {this.state.parts !== undefined ? (
          <div className="horizontal-wrapper selection-section">
            <div className="sku-detail-section">
              <div className="table-title">
                <h4>SKU Information</h4>
              </div>
              <DataTable
                headers={ShipmentCreate.skuDisplayTableHeaders}
                data={this.state.currentSku}
                horizontal
                single
                bodyOverrides={{
                  active: (sku) =>
                    ShipmentCreate.createBooleanCell(sku, 'active'),
                  special: (sku) =>
                    ShipmentCreate.createBooleanCell(sku, 'special'),
                }}
              />
            </div>
            <div className="part-list-section">
              {this.state.shipmentForm.qty ? (
                <div className="selection-display">
                  <h4>
                    {this.state.selectedParts.size} of{' '}
                    {this.state.shipmentForm.qty} selected
                  </h4>
                  <Button
                    variant="tsw-primary"
                    onClick={this.autoselectParts}
                    disabled={
                      !(this.state.shipmentForm.qty && this.state.parts)
                    }
                  >
                    Autoselect First {this.state.shipmentForm.qty}
                  </Button>
                </div>
              ) : (
                ShipmentCreate.infoAlert('Please enter a valid number of parts')
              )}
              <DataTable
                headers={this.partListTableHeaders}
                data={this.state.parts}
                onRowClick={(part) => this.togglePartSelection(part.id)}
                selectedSet={this.state.selectedParts}
                bodyOverrides={{
                  step_object_id: this.createStepCell,
                  fail1_object_id: this.createPartFailCell,
                }}
                emptyMessage="No Valid Parts Found"
              />
              <Button
                variant="tsw-primary"
                onClick={this.createShipment}
                disabled={this.state.shipmentForm.qty ? undefined : true}
              >
                Create Shipment
              </Button>
            </div>
          </div>
        ) : (
          ShipmentCreate.infoAlert(
            'Select a SKU and click Search to see available parts'
          )
        )}
      </div>
    );
  }
}

export default withRouter(ShipmentCreate);
