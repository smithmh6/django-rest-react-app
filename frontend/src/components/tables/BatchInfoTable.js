// BatchInfoTable is used to display batch information
// while working on plates/parts during production
import React, { Component } from 'react';
import withRouter from '../../common/withRouter';

class BatchInfoTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getInputElement = (batch, path) => {
    if (path.includes('notes')) {
      return (
        <textarea
          key={path}
          name={path}
          defaultValue={batch[path]}
          onChange={this.props.handleInputChange.bind(
            this,
            'batch_notes_field'
          )}
        />
      );
    }
    if (path.includes('created') || path.includes('modified')) {
      return new Date(batch[path])
        .toISOString()
        .substring(0, 19)
        .replace('T', ' ');
    }
    if (path === 'sku_object_id') {
      // TODO: Update when sku models are updated
      if (batch.coat_sku_detail) {
        return batch.coat_sku_detail.name;
      }
      if (batch.sheet_sku_detail) {
        return batch.sheet_sku_detail.name;
      }
      if (batch.dice_sku_detail) {
        return batch.dice_sku_detail.name;
      }
      return batch[path];
    }
    if (path.includes('sku')) {
      return BatchInfoTable.getSkuDisplay(batch[path]);
    }
    if (path.includes('selected_plates') || path.includes('selected_parts')) {
      return new Set(this.props.plateCounter).size;
    }
    if (path === 'step_object_id') {
      const { steps } = this.props;
      const stepID = batch.step_object_id;
      if (!steps) return stepID;
      const foundStep = steps.find(({ id }) => id === stepID);
      if (!foundStep) return stepID;
      return foundStep.name;
    }

    return batch[path];
  };

  static getSkuDisplay = (skuObj) => {
    // object won't be available until fetching is done
    // just pass until it is ready bc this is not a critical
    // operation, just for display purposes
    if (!skuObj) return null;

    return skuObj.name;
  };

  render() {
    const { columns, data } = this.props;
    const tableContainerClass = 'table-container batch-info';
    return (
      <div className={tableContainerClass}>
        <table>
          <thead>
            <tr>
              {Object.entries(columns).map(([path, name]) => (
                <th key={path}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((batch) => (
              <tr key={batch.id}>
                {Object.entries(columns).map(([path]) => (
                  <td key={path}>{this.getInputElement(batch, path)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(BatchInfoTable);
