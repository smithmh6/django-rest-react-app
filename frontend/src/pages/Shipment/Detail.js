/* eslint-disable camelcase */
// eslint-disable-next-line max-classes-per-file
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Button } from 'react-bootstrap';
import withRouter from '../../common/withRouter';
import DataTable from '../../components/DataTable';
import {
  ReticleSkuService,
  ReticleStepService,
  ShipmentService,
  ShippingStatusService,
  TARSkuService,
  TARStepService,
  WarehouseService,
} from '../../services/Services';

class ShipmentDetail extends Component {
  static contextType = MsalContext;

  static shipmentTableHeaders = {
    id: 'Shipment',
    item_object_id: 'SKU',
    qty: 'Quantity',
    value: 'Value',
    transfer: 'Transfer No.',
    tracking: 'Tracking No.',
    final: 'Final Order',
    destination_object_id: 'Destination',
    created: 'Created',
    modified: 'Modified',
    status: 'Status',
    notes: 'Notes',
  };

  static tarPartListTableHeaders = {
    serial: 'Serial',
    step_object_id: 'Step',
    batch: 'Batch',
    notes: 'Notes',
  };

  static rttPartListTableHeaders = {
    serial: 'Serial',
    step_object_id: 'Step',
    batch: 'Batch',
    notes: 'Notes',
  };

  static shipmentUpdatableFields = [
    'item_content_type',
    'item_object_id',
    'value',
    'transfer',
    'tracking',
    'final',
    'status',
    'notes',
  ];

  static partsUpdatableFields = ['id', 'notes'];

  static createDateTimeCell = (date) => (
    <td>{new Date(date).toLocaleString()}</td>
  );

  static createQRCodeCell = (item) => {
    return (
      <td key="qr_code">
        <a href={item.qr_code} target="_blank" rel="noreferrer">
          View
        </a>
      </td>
    );
  };

  static nameFromIDinArray = (idToSearch, itemArray, fallbackName) => {
    if (!idToSearch) return '';

    if (!itemArray) return fallbackName;
    const item = itemArray.find(({ id }) => id === idToSearch);

    if (!item) return fallbackName;
    return item.name;
  };

  static contentTypeCell = (data, contentTypeName, stateData, fallbackName) => {
    const idField = `${contentTypeName}_object_id`;
    const id = data[idField];

    return (
      <td key={idField}>
        {ShipmentDetail.nameFromIDinArray(
          id,
          stateData,
          fallbackName || `${contentTypeName} ${id}`
        )}
      </td>
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      shipment: null,
      // sku: null, // SKU information needed? Unsure.
      parts: null,
    };
    this.partTableHeaders = ['Loading...'];
  }

  componentDidMount() {
    this.fetchData();
  }

  createSkuCell = (shipment) => {
    const { startingItem } = this.state;

    // Case: OC SKU, render dropdown
    if (startingItem.item_content_type === 126) {
      if (!this.state.ocSkus || !this.state.fpSkus) {
        return <td key="item_object_id">OC SKU {shipment.item_object_id}</td>;
      }

      const ocSku = this.state.ocSkus.find(
        ({ id }) => id === startingItem.item_object_id
      );

      const validFpSkus = this.state.fpSkus.filter(
        ({ oc_sku }) => oc_sku === ocSku.name
      );

      const skuSet = {
        126: this.state.ocSkus,
        124: this.state.fpSkus,
      }[shipment.item_content_type];

      const skuObj = skuSet.find((sku) => sku.id === shipment.item_object_id);

      const toValueString = (type, id) => {
        return [type, id].join(' ');
      };

      const fromValueString = (str) => {
        const [item_content_type, item_object_id] = str.split(' ');
        return {
          item_content_type: Number(item_content_type),
          item_object_id: Number(item_object_id),
        };
      };

      const onChange = (event) => {
        const { value } = event.target;
        const { item_content_type, item_object_id } = fromValueString(value);
        console.log('event', event);
        console.log('value', value);
        this.setState((prevState) => {
          return {
            shipment: {
              ...prevState.shipment,
              item_content_type,
              item_object_id,
            },
          };
        });
      };

      return (
        <td key="item_object_id">
          <select onChange={onChange}>
            <option
              value={toValueString(
                startingItem.item_content_type,
                startingItem.item_object_id
              )}
            >
              Current: {skuObj.name}
            </option>
            <optgroup label="FP SKUs">
              {validFpSkus.map((fpSku) => (
                <option value={toValueString(124, fpSku.id)}>
                  {fpSku.name}
                </option>
              ))}
            </optgroup>
          </select>
        </td>
      );
    }
    if (shipment.item_content_type === 124) {
      if (!this.state.fpSkus) {
        return <td key="item_object_id">FP SKU {shipment.item_object_id}</td>;
      }

      const skuObj = this.state.fpSkus.find(
        (sku) => sku.id === shipment.item_object_id
      );
      return (
        <td key="item_object_id">{skuObj ? skuObj.name : 'Unknown SKU'}</td>
      );
    }
    if (shipment.item_content_type === 179) {
      if (!this.state.fpSkusRTT) {
        return <td key="item_object_id">FP SKU {shipment.item_object_id}</td>;
      }

      const skuObj = this.state.fpSkusRTT.find(
        (sku) => sku.id === shipment.item_object_id
      );
      return (
        <td key="item_object_id">{skuObj ? skuObj.name : 'Unknown SKU'}</td>
      );
    }
    return <td key="item_object_id">Unrecognized SKU Type</td>;
  };

  fetchData = async () => {
    // Set to null for 'loading'
    this.setState({
      shipment: null,
      parts: null,
      ocSkus: null,
      fpSkus: null,
      fpSkusRTT: null,
    });

    const { id } = this.props.params;

    const [
      shipment,
      parts,
      ocSkus,
      fpSkus,
      fpSkusRTT,
      tarSteps,
      rttSteps,
      warehouses,
      statuses,
    ] = await Promise.all([
      ShipmentService.get(id),
      ShipmentService.getParts(id),
      TARSkuService.getOpticalCoat(),
      TARSkuService.getFinalProduct(),
      ReticleSkuService.getFinalProduct(),
      TARStepService.get(),
      ReticleStepService.get(),
      WarehouseService.get(),
      ShippingStatusService.get(),
    ]);

    if (shipment && !(shipment instanceof Error)) {
      if (shipment.item_content_type === 179) {
        this.partTableHeaders = ShipmentDetail.rttPartListTableHeaders;
        this.shipmentItemSteps = rttSteps;
      } else {
        this.partTableHeaders = ShipmentDetail.tarPartListTableHeaders;
        this.shipmentItemSteps = tarSteps;
      }
      const { item_content_type, item_object_id } = shipment;
      this.setState({
        startingItem: { item_content_type, item_object_id },
      });
    }

    this.setState({
      shipment,
      parts,
      ocSkus,
      fpSkus,
      fpSkusRTT,
      warehouses,
      steps: this.shipmentItemSteps,
      statuses,
    });
  };

  // TODO: update by ID instead of serial
  updatePart = (serial, field, value) => {
    this.setState((prevState) => {
      return {
        parts: prevState.parts.map((part) =>
          part.serial === serial ? { ...part, [field]: value } : part
        ),
      };
    });
  };

  // TODO: use to create edit inputs for tracking, transfer, etc fields
  // eslint-disable-next-line react/no-unused-class-component-methods
  updateShipment = (field, value) => {
    this.setState((prevState) => {
      return {
        shipment: { ...prevState.shipment, [field]: value },
      };
    });
  };

  handleSave = async () => {
    const { shipment, parts } = this.state;
    const { id } = shipment;

    const shipmentToSend = Object.fromEntries(
      ShipmentDetail.shipmentUpdatableFields.map((name) => [
        name,
        shipment[name],
      ])
    );

    const partsToSend = parts.map((part) =>
      Object.fromEntries(
        ShipmentDetail.partsUpdatableFields.map((name) => [name, part[name]])
      )
    );

    if (shipmentToSend.status === 'DELIVERED') {
      if (
        !window.confirm(
          `Confirm closing of Shipment ${this.state.shipment.id}:`
        )
      )
        return;
    }

    this.setState({
      shipment: null,
      parts: null,
    });

    try {
      const newShipment = await ShipmentService.update(id, shipmentToSend);
      const newParts = await ShipmentService.updateParts(id, partsToSend);

      if (newShipment.status === 'DELIVERED') {
        this.props.navigate('/shipments/');
      }

      this.setState({
        shipment: newShipment,
        parts: newParts,
      });
    } catch (error) {
      this.setState({ shipment: error, parts: error });
    }
  };

  // TODO: make sure to call with ID
  createPartNotesCell = (part) => {
    const handler = (event) => {
      const value = event.target.value === '' ? null : event.target.value;
      this.updatePart(part.serial, 'notes', value);
    };
    return (
      <td key="notes">
        <textarea value={part.notes ?? ''} onChange={handler} />
      </td>
    );
  };

  inputCell = (shipment, field, placeholder, size) => {
    const onChange = (event) => {
      const value = event.target.value === '' ? null : event.target.value;
      this.updateShipment(field, value);
    };

    return (
      <td key={field}>
        <input
          value={shipment[field] ?? ''}
          size={size}
          onChange={onChange}
          placeholder={placeholder}
        />
      </td>
    );
  };

  createStatusCell = (shipment) => {
    const handler = (event) => {
      this.updateShipment('status', event.target.value);
    };

    const { statuses } = this.state;

    let inner = shipment.status;

    if (statuses) {
      inner = statuses.map(({ id, code, name }) => (
        <option key={id} value={code}>
          {name}
        </option>
      ));
    }

    return (
      <td key="completed">
        <select value={shipment.status} onChange={handler}>
          {inner}
        </select>
      </td>
    );
  };

  createShipmentNotesCell = (shipment) => {
    const handler = (event) => {
      const value = event.target.value === '' ? null : event.target.value;
      this.updateShipment('notes', value);
    };
    return (
      <td key="notes">
        <textarea value={shipment.notes ?? ''} onChange={handler} />
      </td>
    );
  };

  render() {
    return (
      <div className="tsw-page tar-batch-detail">
        <Button
          variant="tsw-primary"
          className="back-nav-button"
          onClick={() => this.props.navigate('/shipments')}
        >
          &#8678; Back to Shipments
        </Button>
        <Button
          variant="tsw-primary"
          onClick={() => this.handleSave()}
          disabled={!(this.state.shipment && this.state.parts)}
        >
          Save Data
        </Button>
        <div className="horizontal-wrapper">
          <DataTable
            headers={ShipmentDetail.shipmentTableHeaders}
            data={this.state.shipment}
            single
            horizontal
            bodyOverrides={{
              item_object_id: this.createSkuCell,
              value: (shipment) => this.inputCell(shipment, 'value', '', 14),
              transfer: (shipment) =>
                this.inputCell(shipment, 'transfer', 'TBD', 15),
              tracking: (shipment) =>
                this.inputCell(shipment, 'tracking', 'TBD', 15),
              final: (shipment) => this.inputCell(shipment, 'final', 'TBD', 15),
              destination_object_id: (shipment) =>
                ShipmentDetail.contentTypeCell(
                  shipment,
                  'destination',
                  this.state.warehouses,
                  `Warehouse ${shipment.destination_object_id}`
                ),
              created: (shipment) =>
                ShipmentDetail.createDateTimeCell(shipment.created),
              modified: (shipment) =>
                ShipmentDetail.createDateTimeCell(shipment.modified),
              status: this.createStatusCell,
              notes: this.createShipmentNotesCell,
            }}
            emptyMessage="No parts found for shipment"
          />
          <DataTable
            headers={this.partTableHeaders}
            data={this.state.parts}
            bodyOverrides={{
              step_object_id: (part) =>
                ShipmentDetail.contentTypeCell(part, 'step', this.state.steps),
              notes: (part) => this.createPartNotesCell(part),
            }}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(ShipmentDetail);
