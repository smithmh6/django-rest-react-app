// BatchInfoTable is used to display batch information
// while working on plates/parts during production
import React, { Component } from 'react';
import withRouter from '../../common/withRouter';

class PlateInfoTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderElement = (id, field, value) => {
    const { handleInputChange, failcodes } = this.props;

    if (
      ['fail1_object_id', 'fail2_object_id', 'fail3_object_id'].includes(field)
    ) {
      return (
        <select
          key={id}
          name={field}
          value={value}
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
    if (field.includes('notes')) {
      return (
        <textarea
          key={id}
          name={field}
          defaultValue={value}
          onChange={handleInputChange.bind(this, id)}
        />
      );
    }
    if (['exposed'].includes(field)) {
      return (
        <input
          key={id}
          name={field}
          type="checkbox"
          className="checkbox"
          defaultChecked={!!value}
          onChange={handleInputChange.bind(this, id)}
        />
      );
    }
    if (['recycled'].includes(field)) {
      return (
        <input
          key={id}
          name={field}
          type="checkbox"
          className="toggle"
          defaultChecked={!!value}
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
          defaultValue={value}
          onChange={handleInputChange.bind(this, id)}
        >
          {photomasks.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.name}
            </option>
          ))}
        </select>
      );
    }
    if (['etch_time'].includes(field)) {
      return (
        <input
          key={id}
          name={field}
          type="number"
          className="num-input"
          defaultValue={value}
          onChange={handleInputChange.bind(this, id)}
        />
      );
    }
    return value;
  };

  render() {
    const { plate, columns } = this.props;

    return (
      <div className="table-container batch-info">
        <table>
          <thead>
            <tr>
              {Object.entries(columns).map(([field, name]) => (
                <th key={field}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr
              key={plate.id}
              className={
                parseInt(plate.fail1_object_id, 10) > 1 ? 'fail' : null
              }
            >
              {Object.entries(columns).map(([field]) => (
                <td key={field}>
                  {this.renderElement(plate.id, field, plate[field])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(PlateInfoTable);
