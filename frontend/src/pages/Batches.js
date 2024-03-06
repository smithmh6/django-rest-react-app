import React, { Component } from 'react';
import withRouter from '../common/withRouter';
import BatchListTable from '../components/tables/BatchListTable';
import { columns } from '../common/Constants';
import RequestService from '../services/requests/RequestService';
import { config } from '../Settings';
import '../css/FabNotes.css';
import '../css/App.css';
import '../css/Inputs.css';
import '../css/Tables.css';
import '../css/Buttons.css';

class Batches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batches: null,
      isFetching: true,
      errors: [],
      batchForm: { name: '' },
      fabNotes: {},
      // rework: false,
      showFabNotes: false,
    };

    this.requestService = new RequestService('batch', props);
    this.fabNoteService = new RequestService('fabNote', props);
  }

  componentDidMount() {
    // After mounting, populate batches
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    // If batch changed, reset form
    // And fetch new batch info
    if (this.props.params !== prevProps.params) {
      this.fetchData();
    }
  }

  getNextBatchNo = (batchNum) => {
    const { batchType } = this.props.params;

    const batchPrefix = {
      coat: 'CB',
      sheet: 'SB',
      dice: 'DB',
      ship: 'SH',
    }[batchType];

    // If we don't receieve a previous batchNum (ie, null)
    // Then just use the first number, such as CB000001
    if (!batchNum) return `${batchPrefix}000001`;

    const nextNum = parseInt(batchNum.substring(2), 10) + 1;
    // Will break when number rolls over 9999; will have too many zeroes
    const nextNumString = nextNum.toString().padStart(batchNum.length - 2, '0'); // pad number with appropriate number of zeroes
    return batchNum.substring(0, 2) + nextNumString;
  };

  handleInputChange = (event) => {
    const { target } = event;
    const { value, name } = target;
    this.setState((prevState) => ({
      batchForm: { ...prevState.batchForm, [name]: value },
    }));
  };

  handleNoteChange = (event) => {
    const { value } = event.target;
    this.setState((prevState) => ({
      fabNotes: { ...prevState.fabNotes, text: value },
    }));
  };

  handleBatchSubmit = async (event) => {
    event.preventDefault();
    const { batchType } = this.props.params;
    this.setState({ isFetching: true });

    let formToSubmit = { ...this.state.batchForm };

    // Transform sku name into ID
    const matchingSKU = this.state.skus.find(
      ({ name }) => name === formToSubmit.sku_object_id
    );

    if (!matchingSKU) {
      alert(`No SKU found with name ${formToSubmit.sku_object_id}`);
      this.setState({ isFetching: false });
      return;
    }
    formToSubmit.sku_object_id = matchingSKU.id;

    // Plate amount needs to be determined by # of parts for dice batch
    if (batchType === 'dice') {
      formToSubmit = {
        ...formToSubmit,
        part_qty: Number(formToSubmit.part_qty_property),
      };
      delete formToSubmit.part_qty_property;
    }

    try {
      const data = await this.requestService.httpPost(batchType, formToSubmit); // Make request and wait for response
      const nextBatchNo = this.getNextBatchNo(data.name);

      if (batchType === 'dice') {
        data.part_qty_property = data.part_qty;
      }

      // Update state with info
      this.setState((prevState) => ({
        batches: [data, ...prevState.batches],
        batchForm: {
          name: nextBatchNo,
        },
        isFetching: false,
      }));
    } catch (error) {
      console.error(error);
      alert(error);
      this.setState({ isFetching: false, error: error.message });
    }
  };

  handleNoteSubmit = async (event) => {
    event.preventDefault();
    this.setState({ isFetching: true });

    try {
      const { fabNotes } = this.state;
      const data = await this.fabNoteService.httpPut(fabNotes);

      this.setState({
        fabNotes: data,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
      alert(error);
      this.setState({
        error: error.message,
        isFetching: false,
      });
    }
  };

  fetchData = async () => {
    const { batchType } = this.props.params;
    this.setState({ isFetching: true });

    const highestBatchUrl = `${config.url}api/batches/highest/${batchType}`;
    const skusURL = `${config.url}api/skus/reticle/${batchType}`;
    const stepsURL = `${config.url}api/steps/reticle`;

    try {
      // Call services, destructure responses
      const [batches, fabNotes, highestBatchNum, skus, steps] =
        await Promise.all([
          this.requestService.getAllBatches(batchType),
          this.fabNoteService.httpGet(),
          // TODO: create as service, or integrate into existing service
          RequestService.makeRequest('GET', highestBatchUrl),
          RequestService.makeRequest('GET', skusURL),
          RequestService.makeRequest('GET', stepsURL),
        ]);

      // Send getNextBatchNo either the highest batch num, or null
      // If null, function will create one automatically
      const defaultBatchNum = this.getNextBatchNo(
        highestBatchNum.length ? highestBatchNum[0].name : null
      );

      // For batches in init dice, use the Axapta-specified part qty
      // as the actual part quantity will be zero until dice init is passed
      const convertedBatches = batches.map((batch) =>
        batch.dice_step === 'INIT_DICE'
          ? { ...batch, part_qty_property: batch.part_qty }
          : batch
      );

      this.setState({
        batches: convertedBatches,
        fabNotes,
        batchForm: { name: defaultBatchNum },
        isFetching: false,
        skus,
        steps,
      });
    } catch (error) {
      console.error(`[ERROR] ${error}`);
      this.setState({
        error: error.message,
        isFetching: false,
      });
    }
  };

  render() {
    if (this.state.isFetching)
      return <div id="loader" className="lds-dual-ring overlay" />;
    if (this.state.batches === undefined)
      return (
        <h1 className="error-msg">
          Error fetching batches: {this.state.error}
        </h1>
      );
    return (
      <div className="table-container batch-list tsw-old">
        <div className="fab-notes-wrapper">
          <button
            type="button"
            className="btn toggle-show"
            onClick={() =>
              this.setState((prevState) => ({
                showFabNotes: !prevState.showFabNotes,
              }))
            }
          >
            {this.state.showFabNotes
              ? 'Hide Fabrication Notes'
              : 'Show Fabrication Notes'}
          </button>
          {this.state.showFabNotes && (
            <div className="fab-notes">
              <textarea
                id="fab-notes-text"
                name="fab-notes"
                className="text-area"
                value={this.state.fabNotes.text}
                onChange={this.handleNoteChange}
              />
              <div className="fab-notes-footer">
                <h3>
                  Last edited{' '}
                  {new Date(this.state.fabNotes.modified).toLocaleString()} by{' '}
                  {this.state.fabNotes.last_modified_by}
                </h3>
                <button
                  className="btn"
                  type="submit"
                  onClick={this.handleNoteSubmit}
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
        <BatchListTable
          columns={columns.batchList[this.props.params.batchType]}
          batches={this.state.batches}
          steps={this.state.steps}
          handleSubmit={this.handleBatchSubmit}
          handleInputChange={this.handleInputChange}
          errors={this.state.errors}
          batchForm={this.state.batchForm}
        />
        {this.state.batches.length === 0 ? (
          <div className="msg-text">
            There are no open batches at this time!
          </div>
        ) : null}
      </div>
    );
  }
}

export default withRouter(Batches);
