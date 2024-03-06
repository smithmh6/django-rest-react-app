/* eslint-disable camelcase */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { Button } from 'react-bootstrap';
import withRouter from '../../common/withRouter';
import DataTable from '../../components/DataTable';
import PlusButton from '../../components/buttons/PlusButton';
import {
  ReticleSkuService,
  ShipmentService,
  TARSkuService,
  WarehouseService,
} from '../../services/Services';

class ShipmentList extends Component {
  static contextType = MsalContext;

  static shipmentTableHeaders = {
    id: 'ID',
    item_content_type: 'Type',
    item_object_id: 'Name',
    qty: 'Qty.',
    transfer: 'Transfer Order',
    tracking: 'Tracking No.',
    destination_object_id: 'Destination',
    created: 'Created',
    modified: 'Modified',
    notes: 'Notes',
  };

  static shipmentUpdatableFields = ['id', 'transfer', 'tracking'];

  // Currently, content types are hardcoded
  // Unless we want to set up a view to access
  // the content types, or just add it to the serializer
  static itemContentTypeCell = (shipment) => {
    const skuType = {
      124: 'TAR-FP',
      126: 'TAR-OC',
      179: 'RTT-FP',
    }[shipment.item_content_type];

    return <td key="item_content_type">{skuType}</td>;
  };

  static createTrackingOrderCell = ({ tracking }) => {
    if (tracking) return <td key="tracking">{tracking}</td>;
    return (
      <td key="tracking">
        <input placeholder="Tracking Number" />
      </td>
    );
  };

  static createDateTimeCell = (date, key) => (
    <td key={key}>{new Date(date).toLocaleString()}</td>
  );

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
        {ShipmentList.nameFromIDinArray(
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
      shipments: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ shipments: null });

    const [shipments, ocSkus, fpSkus, fpSkusRTT, warehouses] =
      await Promise.all([
        ShipmentService.getOpen(),
        TARSkuService.getOpticalCoat(),
        TARSkuService.getFinalProduct(),
        ReticleSkuService.getFinalProduct(),
        WarehouseService.get(),
      ]);
    this.setState({
      shipments,
      received: shipments,
      ocSkus,
      fpSkus,
      fpSkusRTT,
      warehouses,
    });
  };

  handleSubmit = async () => {
    const { shipments } = this.state;

    // Reduce shipments to only updatable fields
    const shipmentsToSend = shipments.map((shipment) =>
      Object.fromEntries(
        ShipmentList.shipmentUpdatableFields.map((field) => [
          field,
          shipment[field],
        ])
      )
    );

    this.setState({ shipments: null });
    const returnedShipments = await ShipmentService.updateOpen(shipmentsToSend);

    this.setState({
      shipments: returnedShipments,
      received: returnedShipments,
    });
  };

  itemNameCell = (shipment) => {
    const id = shipment.item_object_id;
    const { ocSkus, fpSkus, fpSkusRTT } = this.state;

    const defaultCell = <td key="item_object_id">{`SKU ${id}`}</td>;

    const skuSet = {
      124: fpSkus,
      126: ocSkus,
      179: fpSkusRTT,
    }[shipment.item_content_type];

    if (!skuSet) return defaultCell;

    const skuObj = skuSet.find((sku) => sku.id === id);
    if (!skuObj) return defaultCell;

    return <td key="item_object_id">{skuObj.name}</td>;
  };

  inputCellIfEmpty = (shipment, field, placeholder, size) => {
    const original = this.state.received.find(({ id }) => id === shipment.id);
    if (original[field]) return <td key={field}>{shipment[field]}</td>;

    const onChange = (event) => {
      this.setState((prevState) => {
        return {
          shipments: prevState.shipments.map((s) =>
            s.id === shipment.id ? { ...s, [field]: event.target.value } : s
          ),
        };
      });
    };

    return (
      <td key={field}>
        <input
          value={shipment[field] ?? ''}
          size={size}
          onChange={onChange}
          placeholder={placeholder}
          onClick={(event) => event.stopPropagation()}
        />
      </td>
    );
  };

  render() {
    return (
      <div className="tsw-page tar-batches">
        <DataTable
          headers={ShipmentList.shipmentTableHeaders}
          data={this.state.shipments}
          bodyOverrides={{
            item_content_type: ShipmentList.itemContentTypeCell,
            item_object_id: this.itemNameCell,
            transfer: (shipment) =>
              this.inputCellIfEmpty(shipment, 'transfer', 'Transfer Order', 12),
            tracking: (shipment) =>
              this.inputCellIfEmpty(shipment, 'tracking', 'Tracking No.', 15),
            created: (shipment) =>
              ShipmentList.createDateTimeCell(shipment.created, 'created'),
            modified: (shipment) =>
              ShipmentList.createDateTimeCell(shipment.modified, 'modified'),
            destination_object_id: (shipment) =>
              ShipmentList.contentTypeCell(
                shipment,
                'destination',
                this.state.warehouses,
                `Warehouse ${shipment.destination_object_id}`
              ),
          }}
          onRowClick={(shipment) =>
            this.props.navigate(`/shipments/${shipment.id}`)
          }
          emptyMessage="No Open Shipments"
        />
        <Button
          onClick={this.handleSubmit}
          disabled={!this.state.shipments}
          variant="tsw-primary"
        >
          Save
        </Button>
        <PlusButton
          onClick={() => this.props.navigate('/shipments/create')}
          testId="navigateToShipmentCreation"
        />
      </div>
    );
  }
}

export default withRouter(ShipmentList);
