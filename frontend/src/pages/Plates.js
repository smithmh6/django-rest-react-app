import React, { Component } from 'react';
import PlateListTable from '../components/tables/PlateListTable';
import BatchInfoTable from '../components/tables/BatchInfoTable';
import withRouter from '../common/withRouter';
import { config } from '../Settings';
import { columns } from '../common/Constants';
import RequestService from '../services/requests/RequestService';
import SkuDetailTable from '../components/tables/SkuDetailTable';

class Plates extends Component {
  static plateIsFailed = (p) => p.fail_1 !== 1;

  selectionViews = ['rework', 'init_photo', 'init_dice', 'init_ship'];

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      plates: [],
      batch: null,
      batchQuantity: 0,
      failcodes: [],
      photomasks: [],
      plateCounter: [],
      selectedPlates: new Set(),
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  handleSerialClick = (plateid) => {
    const { navigate, params } = this.props;
    const { batchType, batchId, batchView } = params;

    if (!this.selectionViews.includes(batchView)) {
      navigate(`/batches/${batchType}/${batchId}/plates/${plateid}/parts`);
    }
  };

  handleRowClick = (plateId, event) => {
    const { batchView } = this.props.params;

    // Ensure selection doesn't fire on non-selectable views
    if (!this.selectionViews.includes(batchView)) {
      return;
    }

    const { selectedPlates } = this.state;

    if (selectedPlates.size && event.shiftKey) {
      // make sure text isn't highlighted
      event.preventDefault();
      document.getSelection().removeAllRanges();

      // Get first, last selected values
      const firstSelectedId = Math.min(...this.state.selectedPlates);
      const firstId = Math.min(firstSelectedId, plateId);
      const lastId = Math.max(firstSelectedId, plateId);
      const isInRange = (v) => firstId <= v && v <= lastId;

      // For all plates with IDs in-between, add ID to selectedPlates
      this.setState((prevState) => {
        const newSet = new Set(prevState.selectedPlates);
        prevState.plates.forEach((plate) => {
          if (isInRange(plate.id)) newSet.add(plate.id);
        });
        return {
          selectedPlates: newSet,
        };
      });
    } else {
      // If single row clicked, toggle that ID in the set
      this.setState((prevState) => {
        const newSet = new Set(prevState.selectedPlates);
        return {
          selectedPlates: newSet.has(plateId)
            ? newSet.delete(plateId) && newSet
            : newSet.add(plateId),
        };
      });
    }
  };

  handleInputChange = (id, event) => {
    const { target } = event;
    const field = target.name;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const { batchType } = this.props.params;

    // If event from batch_notes, update that field and return
    if (id === 'batch_notes_field') {
      this.setState((prevState) => ({
        batch: { ...prevState.batch, [field]: value },
      }));
      return;
    }
    // Otherwise, the ID is from a plate

    // Special cases for fields, convert values accordingly
    if (['exposed'].includes(field)) {
      // override 'exposed' field with timestamp
      value = value === true ? new Date().toISOString() : null;
    }

    if (['pm_sku'].includes(field) && value === '') {
      value = null;
    }

    if (
      ['fail1_object_id', 'fail2_object_id', 'fail3_object_id'].includes(field)
    ) {
      value = parseInt(value, 10);
    }

    // Update plate that has matching ID with value
    this.setState((prevState) => ({
      plates: prevState.plates.map((plate) => {
        if (plate.id === id) {
          return { ...plate, [field]: value };
        }
        return plate;
      }),
    }));

    if (['fail_1', 'fail_2', 'fail_3'].includes(field)) {
      // Fields to access/update determined by batchType
      const [failQtyField] = {
        coat: ['pass_qty'],
        sheet: ['fail_qty'],
        dice: ['part_fail_qty'],
      }[batchType];

      // In dice, we also need to update the 'fail' field of parts
      // which are stored in state.plates
      if (batchType === 'dice') {
        this.setState((prevState) => ({
          plates: prevState.plates.map((plate) =>
            plate.id === id
              ? {
                  ...plate,
                  fail: Plates.plateIsFailed(plate),
                }
              : plate
          ),
        }));
      }

      // Update fail/pass # in batch
      this.setState((prevState) => {
        const newFailCount = prevState.plates.filter((plate) =>
          Plates.plateIsFailed(plate)
        ).length;
        const newPassCount = prevState.batchQuantity - newFailCount;
        return {
          batch: {
            ...prevState.batch,
            // use fail count unless coat, then use pass count
            [failQtyField]: batchType === 'coat' ? newPassCount : newFailCount,
          },
        };
      });
    }
  };

  handlePrev = (event) => {
    event.preventDefault();

    // get the current batch, step state variables
    const { batchType } = this.props.params;
    const { batch, steps } = this.state;

    const currentStepID = batch.step_object_id;

    // Search for the current step, and find its next step
    const currentStep = steps.find(({ id }) => id === currentStepID);
    if (!currentStep) {
      alert(`No step found with ID ${currentStepID}`);
      return;
    }

    const previousStepName = currentStep.previous_step;

    if (!previousStepName) {
      alert(`Cannot go back from ${currentStep.name}`);
      return;
    }

    const previousStep = steps.find(({ name }) => name === previousStepName);

    // First update batch
    this.setState((prevState) => ({
      batch: {
        ...prevState.batch,
        step_object_id: previousStep.id,
      },
    }));

    // Then update plates/parts
    // Only update plates/parts that haven't failed

    if (batchType === 'dice') {
      // Case: dice, update "plates" using part fields instead
      this.setState(
        (prevState) => ({
          plates: prevState.plates.map((plate) => {
            if (Number(plate.fail1_object_id)) {
              return { ...plate, step_object_id: previousStep.id };
            }
            return plate;
          }),
        }),
        () => {
          this.handleSave(event);
        } // Save after the state is updated
      );
    } else {
      // Update the plate records the previous next step
      // Only update plates that haven't failed
      this.setState(
        (prevState) => ({
          plates: prevState.plates.map((plate) =>
            !Plates.plateIsFailed(plate)
              ? { ...plate, step: previousStep.name }
              : plate
          ),
        }),
        () => {
          this.handleSave(event);
        } // Save after the state is updated
      );
    }
  };

  convertSelectedPlates = (plates) => {
    const { batchView, batchType } = this.props.params;
    const { selectedPlates, batch } = this.state;

    if (batchView === 'init_dice') {
      return plates.filter((p) => this.state.selectedPlates.has(p.id));
    }

    // Determine field to be updated
    const selectField = {
      rework: 'in_queue',
      init_photo: 'wip1',
      init_ship: 'ship_batch',
    }[batchView];

    // Determine value to set field to
    const selectValue = ['dice', 'ship'].includes(batchType)
      ? batch[`${batchType}_batch`]
      : false;

    // Replace appropriate fields if in selected
    return plates.map((plate) =>
      selectedPlates.has(plate.id)
        ? { ...plate, [selectField]: selectValue }
        : plate
    );
  };

  handleSave = async (event) => {
    event.preventDefault();
    this.setState({ isFetching: true });

    const { navigate, params } = this.props;
    const { batchId, batchType, batchView } = params;
    const { batch, steps } = this.state;
    let { plates } = this.state;

    const stepID = batch.step_object_id;
    const stepName = steps.find(({ id }) => id === stepID).name;

    // If in selection view, update plates according to selection
    if (this.selectionViews.includes(batchView)) {
      plates = this.convertSelectedPlates(plates);
    }

    // Below loop eliminates sending empty strings to
    // the backend when a number is removed from measurement fields
    // eslint-disable-next-line no-restricted-syntax
    for (const p of plates) {
      if (p.width === '') p.width = null;
      if (p.length === '') p.length = null;
      if (p.thickness === '') p.thickness = null;
    }

    // Determine URLs
    const batchUrl = `${config.url}api/batches/reticle/${batchType}/${batchId}/`;

    let plateUrl;
    if (this.selectionViews.includes(batchView)) {
      plateUrl = `${batchUrl}${batchView}/`;
    } else if (['coat', 'sheet'].includes(batchType)) {
      plateUrl = `${batchUrl}plates/`;
    } else if (['dice'].includes(batchType)) {
      plateUrl = `${batchUrl}parts/`;
    }

    try {
      const data = await Promise.all([
        RequestService.makeRequest('PATCH', plateUrl, plates),
        RequestService.makeRequest('PATCH', batchUrl, batch),
      ]);

      // Move to batch/plate view on certain steps
      if (['WIP1', 'WIP2', 'WIP3', 'TRANSFER'].includes(stepName)) {
        navigate(`/batches/${batchType}`);
      } else {
        navigate(`/batches/${batchType}/${batchId}/plates`);
      }

      // Manually calculate batch part qty for dice init
      if (this.props.params.batchView === 'init_dice') {
        data[1].part_qty_property = data[0].length;
      }

      this.setState({
        plates: data[0],
        batch: data[1],
        selectedPlates: new Set(),
        isFetching: false,
      });
    } catch (error) {
      this.setState({ isFetching: false });
      console.error(error);
      alert(error.message);
    }
  };

  handleNext = (event) => {
    event.preventDefault();

    const { batchView } = this.props.params;

    // Check for correct amount of selected parts on selection views
    if (this.selectionViews.includes(batchView)) {
      const numSelected = this.state.selectedPlates.size;
      const numRequired = this.state.batchQuantity;
      if (numSelected < numRequired) {
        if (
          !window.confirm(
            `Too few (${numSelected}/${numRequired}) parts selected. Are you sure you want to continue?`
          )
        ) {
          return;
        }
      }
      if (numSelected > numRequired) {
        if (
          !window.confirm(
            `Too many (${numSelected}/${numRequired}) parts selected. Are you sure you want to continue?`
          )
        ) {
          return;
        }
      }
    }

    // Get the current batch, step state variables
    const { batch, steps } = this.state;
    const currentStepID = batch.step_object_id;

    // Search for the current step, and find its next step
    const currentStep = steps.find(({ id }) => id === currentStepID);
    if (!currentStep) {
      alert(`No step found with ID ${currentStepID}`);
      return;
    }
    const nextStepName = currentStep.next_step;
    if (nextStepName === undefined) {
      alert(`No next step found for ${currentStepID}`);
      return;
    }

    const nextStepID = steps.find(
      // eslint-disable-next-line camelcase
      ({ name }) => name === nextStepName
    ).id;

    // update the batch state with the next step
    this.setState((prevState) => ({
      batch: {
        ...prevState.batch,
        step_object_id: nextStepID,
      },
    }));

    // Update unfailed plates' step
    this.setState(
      (prevState) => ({
        plates: prevState.plates.map((plate) => {
          if (Number(plate.fail1_object_id) === 1) {
            return { ...plate, step_object_id: nextStepID };
          }
          return plate;
        }),
      }),
      () => {
        this.handleSave(event);
      } // Save after the state is updated
    );
  };

  getPlateColumns = () => {
    if (!this.state.batch) return [];

    const { batchType, batchView } = this.props.params;

    if (batchView === 'init_dice') {
      return {
        serial: 'Serial',
        part_qty: 'Total Parts',
        available_parts: 'Available Parts',
        fail1_object_id: 'Fail 1',
        fail2_object_id: 'Fail 2',
        fail3_object_id: 'Fail 3',
        notes: 'Notes',
      };
    }
    const plateColumns = { ...columns.plateList[batchType] };

    if (batchView === 'init_photo') {
      plateColumns.high_grade = 'High Grade';
    }
    return plateColumns;
  };

  navigateToBatches = (event) => {
    event.preventDefault();
    const { navigate, params } = this.props;
    navigate(`/batches/${params.batchType}`);
  };

  fetchData = async () => {
    this.setState({ isFetching: true });
    const { batchId, batchType, batchView } = this.props.params;

    // Determine Batch Url
    const batchUrl = `${config.url}api/batches/reticle/${batchType}/${batchId}`;

    // Determine plates URL
    let platesUrl;
    if (this.selectionViews.includes(batchView)) {
      platesUrl = `${batchUrl}/${batchView}`;
    } else if (['coat', 'sheet'].includes(batchType)) {
      platesUrl = `${batchUrl}/plates/`;
    } else if (['dice', 'ship'].includes(batchType)) {
      platesUrl = `${batchUrl}/parts/`;
    }

    // Define URLs
    const failcodesUrl = `${config.url}api/failcodes/reticle`;
    const stepsUrl = `${config.url}api/steps/reticle`;

    try {
      const apiCalls = [
        RequestService.makeRequest('GET', batchUrl),
        RequestService.makeRequest('GET', platesUrl),
        RequestService.makeRequest('GET', failcodesUrl),
        RequestService.makeRequest('GET', stepsUrl),
      ];

      // Wait for api calls to resolve and check responses
      const data = await Promise.all(apiCalls);

      const quantityField =
        this.props.params.batchView === 'init_dice'
          ? 'plate_qty'
          : {
              coat: 'qty',
              sheet: 'qty',
              dice: 'qty',
              ship: 'part_qty',
            }[this.props.params.batchType];

      // Update state with new data
      this.setState({
        batch: data[0],
        plates: data[1],
        failcodes: data[2],
        steps: data[3],
        photomasks:
          batchType === 'sheet' ? data[0].sheet_sku_detail.pm_sku : [],
        isFetching: false,
        batchQuantity: data[0][quantityField],
      });
    } catch (error) {
      this.setState({ isFetching: false });
      console.error(error);
      alert(error.message);
    }
  };

  autoselectPlates = () => {
    const { batchQuantity } = this.state;
    const availablePlates = this.state.plates.length;
    const platesToBeSelected = batchQuantity;
    if (availablePlates < batchQuantity) {
      alert('Not enough plates available to autoselect.');
      return;
    }
    this.setState((prevState) => {
      const newSet = new Set();
      prevState.plates.forEach((plate, index) => {
        if (index < platesToBeSelected) newSet.add(plate.id);
      });
      return {
        selectedPlates: newSet,
      };
    });
  };

  render() {
    const { batchType, batchView } = this.props.params;

    const numFailedPlates = this.state.plates.filter(
      (plate) => plate.fail1_object_id !== 1
    ).length;
    const numPassPlates = this.state.plates.filter(
      (plate) => plate.fail1_object_id === 1
    ).length;
    const batch = {
      ...this.state.batch,
      fail_qty: numFailedPlates,
      pass_qty: numPassPlates,
    };

    if (this.state.isFetching)
      return <div id="loader" className="lds-dual-ring overlay" />;

    const diceSkuDetail = this.state.batch.dice_sku_detail;
    const numSelected = this.state.selectedPlates.size;
    const numRequired = this.state.batchQuantity;

    return (
      <>
        <div className="left-nav-content tsw-old">
          <button
            type="button"
            className="btn nav-btn"
            onClick={this.navigateToBatches}
          >
            &#8678; Batches
          </button>
        </div>
        <div className="right-nav-content tsw-old">
          <button
            id="prev_button"
            type="submit"
            name="prev_button"
            className="btn nav-btn"
            onClick={this.handlePrev}
          >
            &#8678; Prev
          </button>
          <button
            id="next_button"
            type="submit"
            name="next_button"
            value=""
            className="btn nav-btn"
            onClick={this.handleNext}
          >
            Next &#8680;
          </button>
          <button
            id="save_button"
            type="submit"
            name="save_batch"
            className="btn nav-btn"
            onClick={
              ['rework', 'init_photo', 'init_dice', 'init_ship'].includes(
                batchView
              )
                ? this.handleNext
                : this.handleSave
            }
          >
            Save
          </button>
        </div>
        <div className="center-nav-content tsw-old">
          <BatchInfoTable
            columns={
              batchView === 'init_dice'
                ? columns.batchInfo[batchView]
                : columns.batchInfo[batchType]
            }
            data={[batch]}
            steps={this.state.steps}
            handleInputChange={this.handleInputChange}
            plateCounter={this.state.plateCounter}
          />
          {this.selectionViews.includes(batchView) && (
            <div className="selection-display">
              <h2
                style={{ color: numRequired === numSelected ? 'green' : 'red' }}
              >
                Selected: {numSelected}/{numRequired}
              </h2>
              <button
                type="button"
                className="btn"
                onClick={this.autoselectPlates}
              >
                Autoselect First {numRequired}
              </button>
            </div>
          )}
          {
            // Currently not rendered- need to fix CSS
            false && (
              <SkuDetailTable
                skuDetail={diceSkuDetail}
                columns={columns.skuDetail[batchType]}
              />
            )
          }
          <PlateListTable
            columns={this.getPlateColumns()}
            plates={this.state.plates}
            selectedPlates={this.state.selectedPlates}
            failcodes={this.state.failcodes}
            photomasks={this.state.photomasks}
            handleRowClick={this.handleRowClick}
            handleInputChange={this.handleInputChange}
            handleSerialClick={this.handleSerialClick}
          />
        </div>
      </>
    );
  }
}

export default withRouter(Plates);
