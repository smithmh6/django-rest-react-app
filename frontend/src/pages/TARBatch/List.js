/* eslint-disable camelcase */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import withRouter from '../../common/withRouter';
import DataTable from '../../components/DataTable';
import ControlledModalForm from '../../components/ControlledForm';
import PlusButton from '../../components/buttons/PlusButton';
import {
  EtchRecipeService,
  RieToolingService,
  TARBatchService,
  TARSkuService,
  TARStepService,
} from '../../services/Services';

class TARBatchList extends Component {
  static contextType = MsalContext;

  static tableFieldData = {
    name: 'Batch',
    batch_type: 'Type',
    sku_object_id: 'SKU',
    order_no: 'Order No.',
    step_object_id: 'Step',
    qty: 'QTY',
    fails: 'Fails',
    notes: 'Notes',
    qrcode: 'Label',
  };

  // No inputType means default, text
  static batchCreationInputData = {
    name: { label: 'Batch Number', defaultValue: 'TAR000001' },
    batch_type: {
      label: 'Batch Type',
      inputType: 'radio',
      options: ['PRODUCTION', 'DEVELOPMENT'],
      defaultValue: 'PRODUCTION',
    },
    sku_object_id: {
      label: 'OC SKU',
      inputType: 'select',
      options: ['Loading...'],
    },
    order_no: { label: 'Order No.' },
    qty: { label: 'Part Qty', inputType: 'number' },
    recipe: {
      label: 'Etch Recipe',
      inputType: 'select',
      options: ['Loading...'],
    },
    tooling: {
      label: 'RIE Tooling',
      inputType: 'select',
      options: ['Loading...'],
    },
    notes: { label: 'Notes', inputType: 'textarea' },
  };

  // TODO: implement with proper form conversion
  // after POST API is implemented
  static convertBatchForm = (form) => {
    const formArr = Object.entries(form);
    const filtered = formArr.filter(([, value]) => !!value);
    return Object.fromEntries(filtered);
  };

  static createLabelButton = (batch) => {
    if (!batch.qrcode) return <td key="label" />;
    return (
      <td key="label">
        <a
          href={batch.qrcode}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            className="bi bi-printer-fill label-svg"
            viewBox="0 0 16 16"
          >
            <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z" />
            <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
          </svg>
        </a>
      </td>
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      batches: null,
      steps: null,
      showBatchForm: false,
    };

    this.batchCreationInputData = TARBatchList.batchCreationInputData;
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ batches: null });

    const [steps, opticalSkus, batches, defaultBatchNum, recipes, toolings] =
      await Promise.all([
        TARStepService.get(),
        TARSkuService.getOpticalCoat(),
        TARBatchService.getOpen(),
        TARBatchService.getNextNumber(),
        EtchRecipeService.get(),
        RieToolingService.get(),
      ]);

    const withSelectOneOption = (options) => [
      { value: '', text: '--- Select One ---' },
      ...options,
    ];

    this.batchCreationInputData.name.defaultValue = defaultBatchNum;
    this.batchCreationInputData.sku_object_id.options = withSelectOneOption(
      opticalSkus.map(({ id, name }) => ({ value: id, text: name }))
    );
    this.batchCreationInputData.recipe.options = withSelectOneOption(
      recipes.map(({ rie, id, name }) => ({
        group: rie,
        value: id,
        text: name,
      }))
    );
    this.batchCreationInputData.recipe.groups = ['ALPHA', 'BETA'];
    this.batchCreationInputData.tooling.options = withSelectOneOption(
      toolings.map(({ id, code }) => ({ value: id, text: code }))
    );

    this.setState({ batches, steps, opticalSkus });
  };

  setBatchFormVisibility = (visibility) => {
    this.setState({ showBatchForm: visibility });
  };

  updateWithNewBatch = (batch) => {
    this.setState((prevState) => {
      return { batches: [...prevState.batches.slice(0, -1), batch] };
    });
    this.setBatchFormVisibility(false);
  };

  createStepCell = (batch) => {
    const defaultText = `Step ${batch.step_object_id}`;

    if (!this.state.steps) {
      return <td key="step">{defaultText}</td>;
    }
    const currentStep = this.state.steps.find(
      (step) => step.id === batch.step_object_id
    );
    return <td key="step">{currentStep ? currentStep.name : defaultText}</td>;
  };

  createSkuCell = (batch) => {
    if (!this.state.opticalSkus) {
      return <td key="step">Loading...</td>;
    }

    const skuObj = this.state.opticalSkus.find(
      (sku) => sku.id === batch.sku_object_id
    );
    return <td key="optical-sku">{skuObj ? skuObj.name : 'Unknown SKU'}</td>;
  };

  handleSubmit = async (formValues) => {
    this.setBatchFormVisibility(false);
    this.batchCreationInputData.name.defaultValue = '';
    const convertedValues = TARBatchList.convertBatchForm(formValues);
    const newBatch = await TARBatchService.create(convertedValues);
    this.updateWithNewBatch(newBatch);

    // Reload default batch number after batch creation
    const newBatchNum = await TARBatchService.getNextNumber();
    this.batchCreationInputData.name.defaultValue = newBatchNum;
  };

  render() {
    const inputData = this.batchCreationInputData;

    return (
      <div className="tsw-page tar-batches">
        <DataTable
          headers={TARBatchList.tableFieldData}
          data={this.state.batches}
          onRowClick={(batch) =>
            this.props.navigate(`/batches/tar-batches/${batch.id}`)
          }
          bodyOverrides={{
            step_object_id: this.createStepCell,
            sku_object_id: this.createSkuCell,
            qrcode: TARBatchList.createLabelButton,
          }}
          emptyMessage="No Open Batches"
        />
        <PlusButton
          onClick={() => this.setBatchFormVisibility(true)}
          testId="openTarBatchForm"
        />
        <ControlledModalForm
          title="New TAR Batch"
          inputData={inputData}
          handleSubmit={this.handleSubmit}
          showModal={this.state.showBatchForm}
          handleBack={() => this.setBatchFormVisibility(false)}
        />
      </div>
    );
  }
}

export default withRouter(TARBatchList);
