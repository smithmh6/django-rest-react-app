import React, { Component } from 'react';
import withRouter from '../../common/withRouter';
import '../../css/Tables.css';
import '../../css/Forms.css';

// convert batch type to string
// could probably move to a common folder
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

class TransferListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static handleLabelClick(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  getSkuDisplay = (skuObj) => {
    const { params } = this.props;
    const { batchType } = params;
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
  };

  transferInfoSelector = (batch, path) => {
    if (path === 'batch_type') {
      return displayName(batch[path]);
    }
    if (path === 'qr_code') {
      <a href={batch[path]} target="_blank" rel="noopener noreferrer">
        <input
          className="printer-btn"
          type="submit"
          onClick={TransferListTable.handleLabelClick}
          value="&#128438;"
        />
      </a>;
    }
    if (path.includes('sku_detail')) {
      return this.getSkuDisplay(batch[path]);
    }
    return batch[path];
  };

  render() {
    const {
      batches,
      columns,
      warehouses,
      handleRowClick,
      handleInputChange,
      handleSubmit,
    } = this.props;

    if (!batches || !warehouses) return <div />;

    return (
      <>
        <div className="tsw-old transfer-data-form">
          <input
            id="transferOrder"
            name="transferOrder"
            className="text-input"
            type="text"
            placeholder="Transfer No."
            onChange={handleInputChange}
          />
          <select
            id="shipToWarehouse"
            name="shipToWarehouse"
            className="warehouse-select"
            onChange={handleInputChange.bind(this)}
          >
            <option key="999" value="-1">
              -----
            </option>
            {warehouses.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
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
                    <td key={path}>{this.transferInfoSelector(batch, path)}</td>
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

export default withRouter(TransferListTable);
