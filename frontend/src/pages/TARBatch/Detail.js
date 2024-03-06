/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import withRouter from '../../common/withRouter';
import DataTable from '../../components/DataTable';
import BatchStepper from '../../components/BatchStepper';
import {
  TARBatchService,
  TARFailcodesService,
  TARSkuService,
  TARStepService,
} from '../../services/Services';

class TARBatchDetail extends Component {
  static contextType = MsalContext;

  static last_step_id = 7; // Final QC

  static batchInfoTableHeaders = {
    name: 'Batch',
    step_object_id: 'Step',
    order_no: 'Order',
    sku_object_id: 'SKU',
    qty: 'Parts',
    pass: 'Pass',
    fails: 'Fail',
    created: 'Created',
    modified: 'Modified',
    notes: 'Notes',
    qrcode: 'QR Code',
  };

  static partListTableHeaders = {
    serial: 'Serial',
    index: 'Index',
    pocket: 'Pocket No.',
    step_object_id: 'Step',
    image_data_pre: 'Image-Pre',
    image_data_post: 'Image-Post',
    act_time: 'ACT',
    fail1_object_id: 'Fail',
    notes: 'Notes',
  };

  static batchCellWithClass = (batch, field, className) => {
    return <td className={className}>{batch[field]}</td>;
  };

  static createPassQtyCell = (batch) => {
    if (!batch) return null;
    return <td className="pass">{batch.qty - batch.fails}</td>;
  };

  static createDateTimeCell = (date) => (
    <td>{new Date(date).toLocaleString()}</td>
  );

  static createQRCodeCell = (batch) => {
    return (
      <td key="qrcode">
        <a href={batch.qrcode} target="_blank" rel="noreferrer">
          View
        </a>
      </td>
    );
  };

  constructor(props) {
    super(props);
    this.state = {
      batch: null,
      parts: null,
      opticalSkus: null,
      steps: null,
      failcodes: null,
      showImageModal: false,
      currentImageSerial: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    // Set to null for 'loading'
    this.setState({
      batch: null,
      parts: null,
      opticalSkus: null,
      steps: null,
      failcodes: null,
    });

    const batchId = this.props.params.id;

    const [batch, parts, opticalSkus, steps, failcodes] = await Promise.all([
      TARBatchService.get(batchId),
      TARBatchService.getParts(batchId),
      TARSkuService.getOpticalCoat(),
      TARStepService.get(),
      TARFailcodesService.get(),
    ]);

    this.setState({
      batch,
      parts,
      opticalSkus,
      steps,
      failcodes,
    });
  };

  updatePartById = (id, field, value) => {
    this.setState((prevState) => {
      return {
        parts: prevState.parts.map((part) =>
          part.id === id ? { ...part, [field]: value } : part
        ),
      };
    });
  };

  updateBatch = (field, value) => {
    this.setState((prevState) => {
      return {
        batch: { ...prevState.batch, [field]: value },
      };
    });
  };

  getPreviousDisabled = () => {
    const { steps, batch } = this.state;
    if (!steps || !batch || steps instanceof Error || batch instanceof Error)
      return true;

    const { step_object_id } = batch;
    const step = steps.find(({ id }) => id === step_object_id);

    if (!step || !step.previous_step) return true;
    return false;
  };

  getNextDisabled = () => {
    const { steps, batch } = this.state;
    if (!steps || !batch || steps instanceof Error || batch instanceof Error)
      return true;

    const { step_object_id } = batch;
    const step = steps.find(({ id }) => id === step_object_id);

    if (!step || !step.next_step) return true;
    return false;
  };

  getSaveDisabled = () => {
    const { steps, batch, parts } = this.state;
    if (
      !steps ||
      !batch ||
      !parts ||
      steps instanceof Error ||
      batch instanceof Error ||
      parts instanceof Error
    )
      return true;
    return false;
  };

  handleSave = async () => {
    const { batch, parts } = this.state;
    const batchId = this.state.batch.id;

    this.setState({
      batch: null,
      parts: null,
    });

    // Map parts only to fields that can change
    const partDataToUpdate = parts.map((part) => {
      const { id, pocket, fail1_object_id, notes } = part;
      return { id, pocket, fail1_object_id, notes };
    });

    const data = {
      step_object_id: batch.step_object_id,
      notes: batch.notes,
      parts: partDataToUpdate,
    };

    try {
      const returnedData = await TARBatchService.update(batchId, data);
      this.setState({
        batch: returnedData,
        parts: returnedData.parts,
      });
    } catch (error) {
      this.setState({ batch: error, parts: error });
    }
  };

  stepBatchUsingField = (field) => {
    const { batch, steps } = this.state;
    if (!this.state.batch || !this.state.steps) return;
    const currentStep = steps.find((step) => step.id === batch.step_object_id);
    if (!currentStep[field]) return;
    const newId = steps.find((step) => step.name === currentStep[field]).id;
    this.setState(
      (prevState) => {
        return {
          // Update batch step
          batch: { ...prevState.batch, step_object_id: newId },
        };
      },
      () => this.handleSave()
    );
  };

  getModalImage = () => {
    const { parts, currentImageSerial, batch } = this.state;

    if (!parts || !currentImageSerial || !batch) return null;

    const imageField =
      batch.step_object_id < 5 ? 'image_data_pre' : 'image_data_post';
    const currentPart = parts.find(
      ({ serial }) => Number(serial) === currentImageSerial
    );

    return (
      <img
        src={currentPart[imageField]}
        style={{ height: '80vh' }}
        alt="Not Found"
        className="thumbnail"
      />
    );
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

  createImageCell = (part, srcField) => {
    if (!part[srcField]) {
      return (
        <td style={{ opacity: '0.5' }} key={srcField}>
          N/A
        </td>
      );
    }

    return (
      <td key={srcField}>
        <img
          src={part[srcField]}
          alt="Not Found"
          style={{ width: '100%', maxWidth: '100px' }}
          className="thumbnail"
          onClick={() =>
            this.setState({
              showImageModal: true,
              currentImageSerial: Number(part.serial),
            })
          }
        />
      </td>
    );
  };

  createBatchNotesCell = (batch) => {
    const handler = (event) => {
      const value = event.target.value === '' ? null : event.target.value;
      this.updateBatch('notes', value);
    };
    return (
      <td key="notes">
        <textarea value={batch.notes || ''} onChange={handler} />
      </td>
    );
  };

  createPartPocketCell = (part) => {
    const handler = (event) => {
      this.updatePartById(part.id, 'pocket', event.target.value);
    };

    return (
      <td key="pocket">
        <input type="number" value={part.pocket} onChange={handler} />
      </td>
    );
  };

  // TODO: make sure to call with ID
  createPartNotesCell = (part) => {
    const handler = (event) => {
      const value = event.target.value === '' ? null : event.target.value;
      this.updatePartById(part.id, 'notes', value);
    };
    return (
      <td key="notes">
        <textarea value={part.notes || ''} onChange={handler} />
      </td>
    );
  };

  advanceSerial = () => {
    const currentIndex = this.state.parts.findIndex(
      ({ serial }) => Number(serial) === this.state.currentImageSerial
    );

    if (currentIndex === undefined) return;

    let nextIndex = currentIndex + 1;
    if (nextIndex >= this.state.parts.length) nextIndex = 0;

    this.setState((prevState) => {
      return { currentImageSerial: Number(prevState.parts[nextIndex].serial) };
    });
  };

  toPreviousSerial = () => {
    const currentIndex = this.state.parts.findIndex(
      ({ serial }) => Number(serial) === this.state.currentImageSerial
    );

    if (currentIndex === undefined) return;

    let nextIndex = currentIndex - 1;
    if (nextIndex < 0) nextIndex = this.state.parts.length - 1;

    this.setState((prevState) => {
      return { currentImageSerial: Number(prevState.parts[nextIndex].serial) };
    });
  };

  createPartFailCell = (part) => {
    if (!this.state.failcodes)
      return <td key="fail1_object_id">Failcode {part.fail1_object_id}</td>;

    const handler = (event) => {
      const value = event.target.value === '' ? null : event.target.value;
      this.updatePartById(part.id, 'fail1_object_id', value);
    };
    return (
      <td key="fail">
        <select value={part.fail1_object_id || ''} onChange={handler}>
          <option key="none" value="">
            None
          </option>
          {this.state.failcodes.map((fail) => {
            return (
              <option key={fail.id} value={fail.id}>
                {fail.name}
              </option>
            );
          })}
        </select>
      </td>
    );
  };

  nextStepButton() {
    const { batch } = this.state;
    if (batch && batch.step_object_id === TARBatchDetail.last_step_id) {
      return (
        <Button variant="tsw-primary" onClick={() => this.closeBatch()}>
          Close Batch
        </Button>
      );
    }
    return (
      <Button
        variant="tsw-primary"
        onClick={() => this.stepBatchUsingField('next_step')}
        disabled={this.getNextDisabled()}
      >
        Next Step
      </Button>
    );
  }

  async closeBatch() {
    const { batch, parts } = this.state;
    const batchId = batch.id;

    if (!window.confirm(`Confirm closing of Batch ${batch.name}:`)) return;

    this.setState({ batch: null });

    // Map parts only to fields that can change
    // Can eventually replace with `pick()`
    const partDataToUpdate = parts.map((part) => {
      const { id, pocket, fail1_object_id, notes } = part;
      return { id, pocket, fail1_object_id, notes };
    });

    const batchData = {
      closed: true,
      notes: batch.notes,
      parts: partDataToUpdate,
    };

    const returnedData = await TARBatchService.update(batchId, batchData);
    if (returnedData instanceof Error) {
      this.setState({ batch: returnedData });
    } else {
      this.props.navigate('/batches/tar-batches/');
    }
  }

  render() {
    const partListTableHeaders = { ...TARBatchDetail.partListTableHeaders };

    if (!this.state.batch || this.state.batch.step_object_id !== 2) {
      delete partListTableHeaders.image_data_pre;
    }

    if (!this.state.batch || this.state.batch.step_object_id < 5) {
      delete partListTableHeaders.image_data_post;
    }

    return (
      <div className="tsw-page tar-batch-detail">
        <Button
          variant="tsw-primary"
          className="back-nav-button"
          onClick={() => this.props.navigate('/batches/tar-batches/')}
        >
          &#8678; Back to Batches
        </Button>
        <BatchStepper
          steps={this.state.steps && this.state.steps}
          currentStepId={
            this.state.batch ? this.state.batch.step_object_id : null
          }
        />
        <ButtonGroup>
          <Button
            variant="tsw-primary"
            onClick={() => this.stepBatchUsingField('previous_step')}
            disabled={this.getPreviousDisabled()}
          >
            Previous Step
          </Button>
          <Button
            variant="tsw-primary"
            onClick={() => this.handleSave()}
            disabled={this.getSaveDisabled()}
          >
            Save Data
          </Button>
          {this.nextStepButton()}
        </ButtonGroup>
        <div className="horizontal-wrapper">
          <DataTable
            headers={TARBatchDetail.batchInfoTableHeaders}
            data={this.state.batch}
            single
            horizontal
            bodyOverrides={{
              sku_object_id: (batch) => this.createSkuCell(batch),
              step_object_id: (batch) => this.createStepCell(batch),
              created: (batch) =>
                TARBatchDetail.createDateTimeCell(batch.created),
              modified: (batch) =>
                TARBatchDetail.createDateTimeCell(batch.modified),
              pass: (batch) => TARBatchDetail.createPassQtyCell(batch),
              fails: (batch) =>
                TARBatchDetail.batchCellWithClass(batch, 'fails', 'fail'),
              notes: (batch) => this.createBatchNotesCell(batch),
              qrcode: (batch) => TARBatchDetail.createQRCodeCell(batch),
            }}
          />
          <DataTable
            headers={partListTableHeaders}
            data={this.state.parts}
            bodyOverrides={{
              pocket: (part) => this.createPartPocketCell(part),
              step_object_id: (part) => this.createStepCell(part),
              image_data_pre: (part) =>
                this.createImageCell(part, 'image_data_pre'),
              image_data_post: (part) =>
                this.createImageCell(part, 'image_data_post'),
              notes: (part) => this.createPartNotesCell(part),
              fail1_object_id: (part) => this.createPartFailCell(part),
            }}
            emptyMessage="Unable to find parts in batch"
          />
        </div>
        <Modal
          className="tsw-modal"
          show={this.state.showImageModal}
          onHide={() => this.setState({ showImageModal: false })}
          size="lg"
        >
          Current Serial: {this.state.currentImageSerial}
          {this.getModalImage()}
          <div className="horizontal-wrapper">
            {this.state.parts &&
              this.state.currentImageSerial &&
              this.createPartFailCell(
                this.state.parts.find(
                  (part) =>
                    Number(part.serial) === this.state.currentImageSerial
                )
              )}

            <Button variant="warning" onClick={this.toPreviousSerial}>
              Previous
            </Button>
            <Button variant="success" onClick={this.advanceSerial}>
              Next
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() => this.setState({ showImageModal: false })}
            >
              Close
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withRouter(TARBatchDetail);
