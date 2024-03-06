import React, { Component } from 'react';
import withRouter from '../common/withRouter';
import { config } from '../Settings';
import { columns } from '../common/Constants';
import SkuDetailTable from '../components/tables/SkuDetailTable';
import PartListTable from '../components/tables/PartListTable';
import PlateInfoTable from '../components/tables/PlateInfoTable';
import RequestService from '../services/requests/RequestService';

// this view is only used during the SHEET route
// because we need to track parts AND plates
class Parts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batch: null,
      plate: null,
      parts: [],
      failcodes: [],
      // steps: [],
      isFetching: true,
    };

    this.batchService = new RequestService('batch', props);
    this.plateService = new RequestService('plate', props);
    this.partService = new RequestService('part', props);
  }

  componentDidMount() {
    this.fetchData();
  }

  handleInputChange = (id, event) => {
    // Get event information
    const { target } = event;
    const inputName = target.name;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    // if value is empty string, make it null
    if (value === '') {
      value = null;
    }
    const valueAsInt = parseInt(value, 10);

    // Get state/plate information
    // and define fail fields
    const { plate } = this.state;
    const { id: plateId, part_qty: partQty } = plate; // plate ID
    // the fail column to update is determined by batch type
    const plateFailQtyField = 'part_fail_qty';
    const batchFailQtyField = 'fail_qty';

    // Case: ID is a part
    if (id !== plateId) {
      // Update part with new information
      this.setState((prevState) => ({
        parts: prevState.parts.map((part) =>
          part.id === id
            ? {
                ...part,
                [inputName]: value,
                fail:
                  inputName === 'fail1_object_id'
                    ? valueAsInt !== 1
                    : part.fail,
              }
            : part
        ),
      }));

      // Special case: fail 1 was changed
      // Update batch and plate information based off of current fails
      if (inputName === 'fail1_object_id') {
        this.setState((prevState) => {
          const newFailCount = prevState.parts.filter(
            (p) => Number(p.fail1_object_id) !== 1
          ).length;
          const failcodeNone = 1;
          const plateWasFailed =
            prevState.plate.fail1_object_id !== failcodeNone;
          const plateIsFailed = newFailCount === partQty;

          let mostCommonFailcode;

          // If all fail, get most common failcode
          if (plateIsFailed) {
            // Generate list of failcodes, from each part
            const partFails = prevState.parts
              .map((part) => Number(part.fail1_object_id))
              .filter((fail) => fail !== 1);

            // Get # of times fail codes appear in parts
            const failFrequencies = {};
            partFails.forEach((fail) => {
              if (failFrequencies[fail]) {
                failFrequencies[fail] += 1;
              } else {
                failFrequencies[fail] = 1;
              }
            });

            // Get most common failcode
            const sortedFrequencies = Object.entries(failFrequencies).sort(
              ([, v1], [, v2]) => v2 - v1
            );

            mostCommonFailcode = Number(sortedFrequencies[0][0]);
          }

          // temporary solution until batch fail # is computed
          const changeNum = Number(plateIsFailed) - Number(plateWasFailed);

          return {
            plate: {
              ...prevState.plate,
              [plateFailQtyField]: newFailCount,
              fail1_object_id: plateIsFailed
                ? mostCommonFailcode
                : failcodeNone,
            },
            // TODO: fix batch logic so it's derived from all plates.
            batch: {
              ...prevState.batch,
              [batchFailQtyField]:
                prevState.batch[batchFailQtyField] + changeNum,
            },
          };
        });
      }
    } else if (id === plateId) {
      // Case: id is a plateID
      const plateFailcode = parseInt(plate.fail1_object_id, 10);

      if (['exposed'].includes(inputName)) {
        // override 'exposed' field with timestamp
        value = value === true ? new Date().toISOString() : null;
      }

      // Special case: fail 1 input is updated
      if (inputName === 'fail1_object_id') {
        // Case: unfailed plate becomes failed
        if (valueAsInt > 1 && plateFailcode === 1) {
          console.log('hitting failed plate case');
          this.setState((prevState) => ({
            batch: {
              ...prevState.batch,
              [batchFailQtyField]: prevState.batch[batchFailQtyField] + 1,
            },
            parts: prevState.parts.map((part) =>
              part.fail1_object_id === 1
                ? { ...part, fail1_object_id: value }
                : part
            ),
          }));

          // Case: failed plate becomes unfailed
        } else if (valueAsInt === 1 && plateFailcode !== 1) {
          this.setState((prevState) => ({
            batch: {
              ...prevState.batch,
              [batchFailQtyField]: prevState.batch[batchFailQtyField] - 1,
            },
            parts: prevState.parts.map((part) =>
              Number(part.fail1_object_id) === plateFailcode
                ? {
                    ...part,
                    fail1_object_id: 1,
                  }
                : part
            ),
          }));
        }
      }

      // Update plate state with value and new fail count
      // note: FailQty is "updated" regardless of input, could be optimized
      this.setState((prevState) => {
        const newFailCount = prevState.parts.filter(
          (p) => p.fail1_object_id !== 1
        ).length;
        return {
          plate: {
            ...prevState.plate,
            [inputName]: value,
            [plateFailQtyField]: newFailCount,
          },
        };
      });
    }
  };

  navigateToPlates = () => {
    const { navigate, params } = this.props;
    const { batchId, batchType } = params;
    navigate(`/batches/${batchType}/${batchId}/plates/`);
  };

  // handlePrevPlate = (event) => {};

  // handleNextPlate = (event) => {};

  handleSave = async () => {
    this.setState({ isFetching: true });

    const { navigate, params } = this.props;
    const { batchId, batchType, plateId } = params;
    const { batch, plate, parts } = this.state;
    const step = batch[`${batchType}_step`];

    try {
      const data = await Promise.all([
        this.batchService.httpPatch(batchType, batchId, batch),
        this.plateService.httpPatch(batchType, batchId, [plate]), // need to wrap in array for patch
        this.partService.httpPatch(batchType, batchId, plateId, parts),
      ]);

      data[1][0].part_fail_qty = data[2].filter(
        (part) => part.fail1_object_id !== 1
      ).length;

      // Update state
      this.setState(
        {
          batch: data[0],
          plate: data[1][0],
          parts: data[2],
          isFetching: false,
        },
        () => {
          if (['WIP1', 'WIP2'].includes(step)) {
            navigate(`/batches/${batchType}`);
          } else {
            navigate(
              `/batches/${batchType}/${batchId}/plates/${plateId}/parts`
            );
          }
        }
      );
    } catch (error) {
      this.setState({ isFetching: false });
      console.error(error);
      alert(error.message);
    }
  };

  fetchData = async () => {
    this.setState({ isFetching: true });

    const { batchId, batchType, plateId } = this.props.params;
    const failcodesUrl = `${config.url}api/failcodes/reticle/`;
    const stepsUrl = `${config.url}api/steps/reticle/`;

    try {
      const data = await Promise.all([
        this.batchService.httpGet(batchType, batchId),
        this.plateService.httpGet(batchType, batchId, plateId),
        this.partService.httpGet(batchType, batchId, plateId),
        RequestService.makeRequest('GET', failcodesUrl),
        RequestService.makeRequest('GET', stepsUrl),
      ]);

      this.setState({
        batch: data[0],
        plate: data[1],
        parts: data[2],
        failcodes: data[3],
        // steps: data[4],
        isFetching: false,
      });
    } catch (error) {
      this.setState({ isFetching: false });
      console.error(error);
      alert(error.message);
    }
  };

  render() {
    const { batchType } = this.props.params;

    if (this.state.isFetching)
      return <div id="loader" className="lds-dual-ring overlay" />;

    return (
      <>
        <div className="left-nav-content tsw-old">
          {
            // <input
            //   id="prev_plate_button"
            //   type="submit"
            //   name="prev_plate_button"
            //   value="&#8678; Prev Plate"
            //   className="btn nav-btn"
            //   onClick={this.handlePrevPlate} />
          }
          <button
            type="button"
            className="btn nav-btn"
            onClick={this.navigateToPlates}
          >
            &#8678; Plates
          </button>
        </div>
        <div className="right-nav-content tsw-old">
          {
            // <input
            //   id="next_plate_button"
            //   type="submit"
            //   name="next_plate_button"
            //   value="Next Plate &#8680;"
            //   className="btn nav-btn"
            //   onClick={this.handleNextPlate} />
          }
          <input
            id="save_button"
            type="submit"
            name="save_button"
            value="Save"
            className="btn nav-btn"
            onClick={this.handleSave}
          />
        </div>
        <div className="center-nav-content tsw-old">
          <PlateInfoTable
            columns={columns.plateList[batchType]}
            plate={this.state.plate}
            handleInputChange={this.handleInputChange}
            failcodes={this.state.failcodes}
            photomasks={
              batchType === 'sheet' && this.state.batch
                ? this.state.batch.sheet_sku_detail.pm_sku
                : null
            }
          />
          <SkuDetailTable
            skuDetail={
              batchType === 'sheet' && this.state.batch
                ? this.state.batch.sheet_sku_detail
                : null
            }
            columns={columns.skuDetail[batchType]}
          />
          <PartListTable
            skuDetail={
              batchType === 'sheet' && this.state.batch
                ? [this.state.batch.sheet_sku_detail]
                : null
            }
            columns={columns.partList[batchType]}
            parts={this.state.parts}
            failcodes={this.state.failcodes}
            handleInputChange={this.handleInputChange}
          />
        </div>
      </>
    );
  }
}

export default withRouter(Parts);
