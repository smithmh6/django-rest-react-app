import React, { Component } from 'react';
import withRouter from '../../common/withRouter';
import '../../css/Tables.css';

// convert batch type to string
function displayName(t) {
  if (t === 0) {
    return 'Production';
  }
  if (t === 1) {
    return 'R&D';
  }
  return 'None';
}

// ^^^^^^^^^^^ the above function could be expanded
// for many different keywords and the ternary if
// statement below can be replaced with the function

class ShipmentListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static handleLabelClick(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  getSkuDisplay(skuObj) {
    const { batchType } = this.props.params;
    // object won't be available until fetching is done
    // just pass until it is ready bc this is not a critical
    // operation, just for display purposes
    if (!skuObj) return null;

    const skuTypes = {
      coat: 'coat_sku',
      sheet: 'sheet_sku',
      dice: 'dice_sku',
      ship: 'fp_sku',
    };

    const propertyToGet = skuTypes[batchType];
    return skuObj[propertyToGet];
  }

  shipmentInfoSelector(batch, path) {
    if (path === 'batch_type') {
      return displayName(batch[path]);
    }
    if (path === 'qr_code') {
      return (
        <a href={batch[path]} target="_blank" rel="noopener noreferrer">
          <input
            className="printer-btn"
            type="submit"
            onClick={ShipmentListTable.handleLabelClick}
            value="&#128438;"
          />
        </a>
      );
    }
    if (path.includes('sku_detail')) {
      return this.getSkuDisplay(batch[path]);
    }
    return batch[path];
  }

  render() {
    const {
      batches,
      columns,
      handleRowClick,
      handleInputChange,
      handleSubmit,
    } = this.props;

    if (!batches) return <div />;

    return (
      <>
        <div className="tsw-old transfer-data-form">
          <input
            id="trackingNo"
            name="trackingNo"
            className="text-input"
            type="text"
            placeholder="Tracking No."
            onChange={handleInputChange}
          />
          <input
            id="save_button"
            type="submit"
            name="save_batch"
            value="Save"
            className="btn nav-btn"
            onClick={handleSubmit}
          />
        </div>
        <div className="tsw-old table-container batch-list">
          <table>
            <thead>
              <tr>
                {Object.entries(columns).map(([path, name]) => (
                  <th key={path}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr
                  key={batch.id}
                  className="clickable"
                  onClick={handleRowClick.bind(this, batch.id)}
                >
                  {Object.entries(columns).map(([path]) => (
                    <td key={path}>{this.shipmentInfoSelector(batch, path)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}

export default withRouter(ShipmentListTable);
