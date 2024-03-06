import React, { Component } from 'react';
import withRouter from '../../common/withRouter';

class PartListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getClassNames = (part) => {
    const classNames = [];

    if (part.fail1_object_id && parseInt(part.fail1_object_id, 10) !== 1)
      classNames.push('fail');
    if (this.props.selectedParts && this.props.selectedParts.has(part.id))
      classNames.push('selected');

    // If CD is required, compare part values to SKU min/max
    const { skuDetail } = this.props;
    if (skuDetail[0].cd_required) {
      const { etch_cd: etchCd, photo_cd: photoCd } = part;
      const { cd_max: cdMax, cd_min: cdMin } = skuDetail[0];
      // Check if etchCd and photoCd are out of range
      // But only check if truthy value (not 0, '', null, etc)
      const etchOutOfRange = etchCd && (etchCd < cdMin || etchCd > cdMax);
      const photoOutOfRange = photoCd && (photoCd < cdMin || photoCd > cdMax);
      if (etchOutOfRange || photoOutOfRange) classNames.push('warning');
    }

    return classNames.join(' ');
  };

  // render elements based on field names
  renderElement = (id, field, value) => {
    const { batchView } = this.props.params;
    let disable = false;

    if (['rework', 'init_photo', 'init_dice'].includes(batchView)) {
      disable = true;
    }

    if (
      ['fail1_object_id', 'fail2_object_id', 'fail3_object_id'].includes(field)
    ) {
      return (
        <select
          key={id}
          name={field}
          disabled={disable}
          value={value}
          onChange={this.props.handleInputChange.bind(this, id)}
        >
          {this.props.failcodes.map((code) => (
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
          disabled={disable}
          defaultValue={value}
          onChange={this.props.handleInputChange.bind(this, id)}
        />
      );
    }
    if (['photo_cd', 'etch_cd'].includes(field)) {
      return (
        <input
          key={id}
          name={field}
          type="number"
          disabled={disable}
          defaultValue={value}
          className="num-input"
          onChange={this.props.handleInputChange.bind(this, id)}
        />
      );
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
          onChange={this.props.handleInputChange.bind(this, id)}
        />
      );
    }
    return value;
  };

  render() {
    const { columns, parts, handleRowClick } = this.props;
    if (!columns || !parts) {
      console.error(
        'Missing either columns or parts.\nColumns: ',
        columns,
        '\nParts: ',
        parts
      );
      return null;
    }

    return (
      <div className="table-container plate-list">
        <table>
          <thead>
            <tr>
              {Object.entries(columns).map(([path, name]) => (
                <th key={path}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr
                onClick={
                  handleRowClick ? handleRowClick.bind(this, part.id) : null
                }
                key={part.id}
                name={part.id}
                className={this.getClassNames(part)}
              >
                {Object.entries(columns).map(([path]) => (
                  <td key={path}>
                    {this.renderElement(part.id, path, part[path])}
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

export default withRouter(PartListTable);
