import React, { Component } from 'react';
import withRouter from '../../common/withRouter';
import '../../css/Tables.css';

// convert batch type to string
function displayName(t) {
  if (t === 0) return 'Production';
  if (t === 1) return 'R&D';
  return 'None';
}

// ^^^^^^^^^^^ the above function could be expanded
// for many different keywords and the ternary if
// statement below can be replaced with the function

function handleLabelClick(event) {
  event.stopPropagation();
  event.preventDefault();
}

class BatchListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleRowClick = (batch) => {
    const { navigate, params } = this.props;
    const { batchType } = params;

    // Step IDs are hardcoded below.
    // TODO: Get steps from endpoint & pass as props
    if (
      batchType === 'coat' &&
      batch.coat_sku_detail.name.includes('-RW') &&
      batch.step_object_id === 1 // Serialize step is 1
    ) {
      navigate(`/batches/${batchType}/${batch.id}/rework`);
      // Step INIT_PHOTO is 9
    } else if (batchType === 'sheet' && batch.step_object_id === 8) {
      navigate(`/batches/${batchType}/${batch.id}/init_photo`);
      // Step INIT_DICE is 20
    } else if (batchType === 'dice' && batch.step_object_id === 20) {
      navigate(`/batches/${batchType}/${batch.id}/init_dice`);
    } else if (batchType === 'ship' && batch.ship_step === 'INIT_SHIP') {
      navigate(`/batches/${batchType}/${batch.id}/init_ship`);
    } else {
      // for all others, don't include init keyword
      navigate(`/batches/${batchType}/${batch.id}/plates`);
    }
  };

  static getSkuDisplay = (skuObj) => {
    // object won't be available until fetching is done
    // just pass until it is ready bc this is not a critical
    // operation, just for display purposes
    if (!skuObj) return null;

    return skuObj.name;
  };

  inputSelector(field, display) {
    const { handleInputChange, handleSubmit } = this.props;

    const fieldname = display.toLowerCase();
    if (fieldname.includes('label')) {
      return (
        <input
          name="submit"
          className="plus-btn"
          type="submit"
          value="&#x2b;"
          onClick={handleSubmit}
        />
      );
    }
    if (fieldname === 'batch') {
      const { batchForm } = this.props;
      return (
        <input
          id={field}
          name="name"
          className="text-input"
          type="text"
          placeholder={display}
          onChange={handleInputChange}
          value={batchForm.name} // control value for batch number generation
        />
      );
    }
    if (fieldname.includes('order')) {
      return (
        <input
          id={field}
          name={field}
          className="text-input"
          type="text"
          placeholder={display}
          onChange={handleInputChange}
        />
      );
    }
    if (fieldname.includes('qty')) {
      return (
        <input
          id={field}
          name={field}
          className="text-input"
          type="text"
          placeholder={display}
          onChange={handleInputChange}
        />
      );
    }
    if (fieldname.includes('sku')) {
      return (
        <input
          id={field}
          name={field.replace('_detail', '')}
          className="text-input sku-input"
          type="text"
          placeholder={display}
          onChange={handleInputChange}
        />
      );
    }
    if (fieldname.includes('notes')) {
      return (
        <textarea
          id={field}
          name={field}
          className="text-area"
          placeholder="<Enter Notes Here>"
          onChange={handleInputChange}
        />
      );
    }
    return <div>---</div>;
  }

  batchInfoSelector(batch, path) {
    if (path === 'batch_type') {
      return displayName(batch[path]);
    }
    if (path === 'qr_code' || path === 'qrcode') {
      return (
        <a href={batch[path]} target="_blank" rel="noopener noreferrer">
          <input
            className="printer-btn"
            type="submit"
            onClick={handleLabelClick}
            value="&#128438;"
          />
        </a>
      );
    }
    if (path.includes('sku_detail') || path === 'sku_object_id') {
      const { batchType } = this.props.params;
      return BatchListTable.getSkuDisplay(batch[`${batchType}_sku_detail`]);
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
  }

  render() {
    const { batches, columns, errors } = this.props;

    const columnsArr = Object.entries(columns);

    if (!batches) return <div />;

    return (
      <table>
        <thead>
          <tr>
            {columnsArr.map(([path, name]) => (
              <th key={path}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columnsArr.map(([path, name]) => (
              <td key={name} className={errors[path] ? 'fail' : null}>
                {errors[path] ? (
                  <p className="error-msg">*{errors[path]}</p>
                ) : null}
                {this.inputSelector(path, name)}
              </td>
            ))}
          </tr>
          {batches.map((batch) => (
            <tr
              key={batch.id}
              className="clickable"
              onClick={this.handleRowClick.bind(this, batch)}
            >
              {columnsArr.map(([path]) => (
                <td key={path}>{this.batchInfoSelector(batch, path)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default withRouter(BatchListTable);
