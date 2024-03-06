import { Component, React } from 'react';
import withRouter from '../../common/withRouter';
import {
  EtchRecipeService,
  RieSystemService,
  RieToolingService,
} from '../../services/Services';
import DataTable from '../../components/DataTable';

const systemHeaders = {
  name: 'Name',
  description: 'Description',
  code: 'Code',
};

const recipeHeaders = {
  id: 'ID',
  name: 'Name',
  rie: 'RIE',
};

const toolingHeaders = {
  id: 'ID',
  code: 'Code',
};

class TAREtching extends Component {
  constructor(props) {
    super(props);
    this.state = {
      systems: null,
      recipes: null,
      toolings: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    this.setState({ systems: null, recipes: null, toolings: null });

    const systems = await RieSystemService.get();
    const recipes = await EtchRecipeService.get();
    const toolings = await RieToolingService.get();
    console.log(systems);

    this.setState({ systems, recipes, toolings });
  }

  render() {
    const { systems, recipes, toolings } = this.state;
    return (
      <div className="tsw-page tar-etching" style={{ 'overflow-y': 'scroll' }}>
        <div>
          <h3>Systems</h3>
          <DataTable headers={systemHeaders} data={systems} />
        </div>
        <div className="horizontal-wrapper">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3>Recipes</h3>
            <DataTable headers={recipeHeaders} data={recipes} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3>Toolings</h3>
            <DataTable headers={toolingHeaders} data={toolings} />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(TAREtching);
