import React, { Component } from 'react';
import withRouter from '../../common/withRouter';

class PlateListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // render elements based on field names
  getClassList(plate) {
    // eslint-disable-next-line camelcase
    const { fail1_object_id } = plate;
    const { batchView } = this.props.params;
    const classList = [];

    const isFailed = parseInt(fail1_object_id, 10) > 1;

    if (
      !['rework', 'init_photo', 'init_dice'].includes(batchView) &&
      isFailed
    ) {
      classList.push('fail');
    }

    if (this.props.selectedPlates.has(plate.id)) classList.push('selected');

    if (['rework', 'init_photo', 'init_dice'].includes(batchView))
      classList.push('clickable');

    return classList.join(' ');
  }

  renderElement(id, field, value) {
    const { handleInputChange, failcodes } = this.props;
    const { batchView, batchType } = this.props.params;
    const disable = ['rework', 'init_photo', 'init_dice'].includes(batchView);

    if (
      [
        'fail1_object_id',
        'fail2_object_id',
        'fail3_object_id',
        'ar_failcode',
      ].includes(field)
    ) {
      return (
        <select
          key={id}
          name={field}
          disabled={['sheet'].includes(batchType) || disable}
          defaultValue={value}
          onChange={handleInputChange.bind(this, id)}
        >
          {failcodes.map((code) => (
            <option key={code.id} value={code.id}>
              {code.name}
            </option>
          ))}
        </select>
      );
    }
    if (['high_grade', 'recycled', 'exposed'].includes(field)) {
      if (field === 'high_grade' && batchType === 'sheet') {
        return value && '✔️';
      }

      return (
        <input
          key={id}
          name={field}
          type="checkbox"
          disabled={
            (['sheet', 'dice'].includes(batchType) && field === 'recycled') ||
            disable
          }
          className={field === 'recycled' ? 'toggle' : 'checkbox'}
          defaultChecked={!!value}
          onChange={handleInputChange.bind(this, id)}
        />
      );
    }
    if (field.includes('notes')) {
      return (
        <textarea
          key={id}
          name={field}
          disabled={disable}
          defaultValue={value}
          onChange={handleInputChange.bind(this, id)}
        />
      );
    }
    if (['etch_time', 'act_time'].includes(field)) {
      return (
        <input
          key={id}
          name={field}
          type="number"
          disabled={disable}
          className="num-input"
          defaultValue={value}
          onChange={handleInputChange.bind(this, id)}
        />
      );
    }
    if (field === 'pm_sku') {
      const { photomasks } = this.props;
      return (
        <select
          key={id}
          name={field}
          disabled={disable}
          defaultValue={value}
          onChange={handleInputChange.bind(this, id)}
        >
          <option key="999" value="">
            ----------
          </option>
          {photomasks.map((pm) => (
            <option key={pm.id} value={pm.name}>
              {pm.name}
            </option>
          ))}
        </select>
      );
    }
    if (field === 'serial' && ['sheet'].includes(batchType)) {
      return <div className="clickable">{value}</div>;
    }
    if (['width', 'length', 'thickness'].includes(field)) {
      return (
        <input
          key={id}
          name={field}
          type="number"
          disabled={disable}
          defaultValue={value}
          className="num-input"
          onChange={handleInputChange.bind(this, id)}
        />
      );
    }
    return value;
  }

  render() {
    const { columns, plates, handleRowClick, handleSerialClick } = this.props;
    const { batchType } = this.props.params;
    const containerClass = 'table-container plate-list';

    if (!columns || !plates) return null;
    return (
      <div className={containerClass}>
        <table>
          <thead>
            <tr>
              {Object.entries(columns).map(([field, name]) => (
                <th key={field}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plates.map((plate) => (
              <tr
                key={plate.id}
                name={plate.id}
                className={this.getClassList(plate)}
                onClick={handleRowClick.bind(this, plate.id)}
              >
                {Object.entries(columns).map(([field]) => (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <td
                    key={field}
                    className={
                      field === 'serial' && ['sheet'].includes(batchType)
                        ? 'clickable'
                        : null
                    }
                    onClick={
                      field === 'serial' && ['sheet'].includes(batchType)
                        ? handleSerialClick.bind(this, plate.id)
                        : null
                    }
                  >
                    {this.renderElement(plate.id, field, plate[field])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(PlateListTable);
