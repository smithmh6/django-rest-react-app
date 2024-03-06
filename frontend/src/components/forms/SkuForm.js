import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import withRouter from '../../common/withRouter';
import { config } from '../../Settings';
import { columns } from '../../common/Constants';
import RequestService from '../../services/requests/RequestService';

class SkuForm extends Component {
  static contextType = MsalContext;

  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      skuForm: {},
      errors: [],
    };
  }

  componentDidMount() {
    const { skuType } = this.props.params;

    this.setState({
      skuForm: Object.fromEntries(
        Object.entries(columns.skuForm[skuType]).map(([path]) => [
          path,
          ['active', 'special', 'cd_required'].includes(path) ? false : '',
        ])
      ),
      errors: [],
      isFetching: false,
    });
  }

  componentDidUpdate(prevProps) {
    const { skuType } = this.props.params;

    if (skuType !== prevProps.params.skuType) {
      this.setState({
        skuForm: Object.fromEntries(
          Object.entries(columns.skuForm[skuType]).map(([path]) => [
            path,
            ['active', 'special', 'cd_required'].includes(path) ? false : '',
          ])
        ),
        errors: [],
        isFetching: false,
      });
    }
  }

  handleInputChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState((prevState) => ({
      skuForm: {
        ...prevState.skuForm,
        [name]: value,
      },
    }));
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { navigate, params } = this.props;
    const { productLine, skuType } = params;
    this.setState({ isFetching: true });

    try {
      const url = `${config.url}api/skus/${productLine}/${skuType}/`;

      const formToSubmit = this.state.skuForm;
      // If dice SKU and min_stock is blank, remove field entirely
      // else backend will attempt to parse as integer and fail
      if (skuType === 'dice') {
        if (!formToSubmit.min_stock) delete formToSubmit.min_stock;
      }

      // Remove empty strings
      const formArr = Object.entries(formToSubmit);
      formArr.forEach(([key, value]) => {
        if (value === '') delete formToSubmit[key];
      });

      await RequestService.makeRequest('POST', url, formToSubmit);

      this.setState(
        {
          skuForm: Object.fromEntries(
            Object.entries(columns.skuForm[skuType]).map(([path]) => [
              path,
              ['active', 'special', 'cd_required'].includes(path) ? false : '',
            ])
          ),
          isFetching: false,
        },
        () => {
          navigate(`/skus/${productLine}/${skuType}`);
        }
      );
    } catch (error) {
      this.setState({ isFetching: false });
      console.error(error);
      alert(error.message);
    }
  };

  backToSkus = (event) => {
    event.preventDefault();
    const { navigate } = this.props;
    const { productLine, skuType } = this.props.params;
    navigate(`/skus/${productLine}/${skuType}`);
  };

  inputSelector = (path, name) => {
    if (
      [
        'cd_min',
        'cd_max',
        'cd_target',
        'part_qty',
        'qty',
        'length_min',
        'length_max',
        'length_target',
        'width_min',
        'width_max',
        'width_target',
        'min_part_index',
        'max_part_index',
        'price',
        'cost',
        'stock_min',
      ].includes(path)
    ) {
      return (
        <input
          id={path}
          name={path}
          className="text-input"
          type="number"
          placeholder={name}
          onChange={this.handleInputChange}
        />
      );
    }
    if (['special', 'active', 'cd_required'].includes(path)) {
      return (
        <input
          id={path}
          name={path}
          type="checkbox"
          className="checkbox"
          onChange={this.handleInputChange}
        />
      );
    }
    if (
      [
        'vendor_name',
        'designed',
        'ordered',
        'started',
        'ended',
        'cleaned',
        'vendor',
        'version',
        'serial',
      ].includes(path)
    ) {
      return (
        <input
          id={path}
          name={path}
          className="text-input"
          type="text"
          placeholder={name}
          onChange={this.handleInputChange}
        />
      );
    }
    if (
      path === 'name' ||
      path.includes('sku') ||
      ['location', 'category', 'route'].includes(path)
    ) {
      return (
        <input
          id={path}
          name={path}
          className="text-input sku-input"
          type="text"
          placeholder={name}
          onChange={this.handleInputChange}
        />
      );
    }
    if (['notes', 'description'].includes(path)) {
      return (
        <textarea
          id={path}
          name={path}
          className="text-area sku-form-text-area"
          placeholder={name}
          onChange={this.handleInputChange}
        />
      );
    }
    if (path.includes('release')) {
      return (
        <input
          id={path}
          name={path}
          className="date-input"
          type="datetime-local"
          onChange={this.handleInputChange}
        />
      );
    }
    return <div>---</div>;
  };

  render() {
    const { skuForm, errors } = this.state;
    const { skuType } = this.props.params;

    if (this.state.isFetching)
      return <div id="loader" className="lds-dual-ring overlay" />;

    if (!skuForm) return null;

    return (
      <>
        <div className="tsw-old backToSkusBtn">
          <input
            name="submit"
            className="btn create-btn"
            type="submit"
            value="&#8678; Skus"
            onClick={this.backToSkus}
          />
        </div>
        <div className="tsw-old table-container sku-form">
          <table id="skuDetailTable">
            <tbody>
              {Object.entries(columns.skuForm[skuType]).map(([path, name]) =>
                !['created_date', 'modified_date'].includes(path) ? (
                  <tr key={path}>
                    <th>{name}</th>
                    <td id={path} className={errors[path] ? 'fail' : null}>
                      {errors[path] ? (
                        <p className="error-msg">*{errors[path]}</p>
                      ) : null}
                      {this.inputSelector(path, name)}
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
        <div className="tsw-old newBatchButton">
          <input
            name="submit"
            className="btn create-btn"
            type="submit"
            value="Create"
            onClick={this.handleSubmit}
          />
        </div>
      </>
    );
  }
}

export default withRouter(SkuForm);
