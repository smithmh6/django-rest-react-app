import React, { Component } from 'react';
import withRouter from '../common/withRouter';
import { config } from '../Settings';
import { columns } from '../common/Constants';
import SkuListTable from '../components/tables/SkuListTable';
import RequestService from '../services/requests/RequestService';

class Skus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      skus: [],
    };
  }

  componentDidMount() {
    this.fetchSkus();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.skuType !== prevProps.params.skuType) {
      this.fetchSkus();
    }
  }

  handleInputChange = (event) => {
    const { target } = event;
    const { name, value } = target;

    this.setState((prevState) => ({
      skuForm: {
        ...prevState.skuForm,
        [name]: value,
      },
    }));
  };

  fetchSkus = async () => {
    const { productLine, skuType } = this.props.params;
    this.setState({ isFetching: true });

    try {
      const url = `${config.url}api/skus/${productLine}/${skuType}/`;
      const data = await RequestService.makeRequest('GET', url);

      this.setState({
        skus: data,
        skuForm: {},
        isFetching: false,
      });
    } catch (error) {
      this.setState({ isFetching: false });
      console.error(error);
      alert(error.message);
    }
  };

  render() {
    if (this.state.isFetching)
      return <div id="loader" className="lds-dual-ring overlay" />;

    if (!this.state.skus) return null;

    const { skuType } = this.props.params;

    return (
      <SkuListTable
        columns={columns.skuForm[skuType]}
        skus={this.state.skus}
        handleRowClick={this.handleInputChange}
        errors={this.state.errors}
      />
    );
  }
}

export default withRouter(Skus);
