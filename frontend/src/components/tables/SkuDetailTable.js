// SkuDetailTable is used to display sku information
import React, { Component } from 'react';
import withRouter from '../../common/withRouter';

class SkuDetailTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDisplayValue(field, value) {
    if (field === 'cd_required') {
      return value === true ? 'Yes' : 'No';
    }
    return value;
  }

  render() {
    const { columns, skuDetail } = this.props;

    if (!columns || !skuDetail) return null;

    return (
      <div className="table-container sku-details">
        <table id="skuDetailTable">
          <tbody>
            {Object.entries(columns).map(([field, name]) => (
              <tr key={field}>
                <th>{name}</th>
                <td
                  id={field}
                  className={field.includes('target') ? 'pass' : null}
                >
                  {SkuDetailTable.getDisplayValue(field, skuDetail[field])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(SkuDetailTable);
