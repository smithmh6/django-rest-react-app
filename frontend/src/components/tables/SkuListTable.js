import React, { Component } from 'react';
import withRouter from '../../common/withRouter';
import '../../css/Tables.css';

// ^^^^^^^^^^^ the above function could be expanded
// for many different keywords and the ternary if
// statement below can be replaced with the function

class SkuListTable extends Component {
  static skuInfoSelector(sku, path) {
    if (
      path.includes('created') ||
      path.includes('modified') ||
      path.includes('release')
    ) {
      return SkuListTable.getDateString(sku, path);
    }
    if (['active', 'special', 'cd_required'].includes(path)) {
      return sku[path] === true ? 'Yes' : 'No';
    }
    return sku[path];
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  static handleRowClick = (sku, event) => {
    console.log('Row clicked for SKU ', sku, ' from event ', event);
    // const { navigate } = this.props;
    // const { sku_type } = this.props.params;
    // if (sku_type === 'coat'
    //     && sku.coat_sku.includes('-RW')
    //     && sku.coat_step === 'SER') {
    //   navigate("/skus/" + sku_type + "/" + sku.id + "/rework");
    // } else if (sku_type === 'sheet'
    //     && sku.sheet_step === 'INIT_PHOTO') {
    //       navigate("/skus/" + sku_type + "/" + sku.id + "/init_photo");
    // } else if (sku_type === 'dice'
    //     && sku.dice_step === 'INIT_DICE') {
    //       navigate("/skus/" + sku_type + "/" + sku.id + "/init_dice");
    // } else if (sku_type === 'ship'
    //     && sku.ship_step === 'INIT_SHIP') {
    //       navigate("/skus/" + sku_type + "/" + sku.id + "/init_ship");
    // } else {
    //   // for all others, don't include init keyword
    //   navigate("/skus/" + sku_type + "/" + sku.id + "/plates");
    // }
  };

  static getDateString(sku, path) {
    return sku[path]
      ? new Date(sku[path]).toISOString().substring(0, 10).replace('T', ' ')
      : null;
  }

  createNewSku = (event) => {
    event.preventDefault();
    const { navigate, params } = this.props;
    const { productLine, skuType } = params;
    navigate(`/skus/${productLine}/${skuType}/create`);
  };

  render() {
    const { skus, columns } = this.props;

    if (!skus) return null;

    return (
      <>
        <div className="tsw-old table-container sku-list">
          <table>
            <thead>
              <tr>
                {Object.entries(columns).map(([path, name]) => (
                  <th key={path}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skus.map((sku) => (
                <tr
                  key={sku.id}
                  className="clickable"
                  onClick={(event) => SkuListTable.handleRowClick(sku, event)}
                >
                  {Object.entries(columns).map(([path]) => (
                    <td key={path}>
                      {SkuListTable.skuInfoSelector(sku, path)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="newSkuButton">
          <input
            name="submit"
            className="plus-btn"
            type="submit"
            value="&#x2b;"
            onClick={this.createNewSku}
          />
        </div>
      </>
    );
  }
}

export default withRouter(SkuListTable);
