/* eslint-disable camelcase */
import React, { Component } from 'react';
import withRouter from '../../common/withRouter';
import { TARFailcodesService } from '../../services/Services';
import DataTable from '../../components/DataTable';
import PlusButton from '../../components/buttons/PlusButton';
import ControlledModalForm from '../../components/ControlledForm';

const failsFieldOptions = {
  name: 'Name',
  description: 'Description',
};

const failsInputData = {
  name: {
    label: 'Name',
  },
  description: {
    label: 'Description',
  },
};

class TARFailsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fails: null,
      showCreationModal: false,
      isSubmitting: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const fails = await TARFailcodesService.get();
    this.setState({ fails });
  };

  createFail = async (values) => {
    this.setState({ isSubmitting: true });

    const newFail = await TARFailcodesService.create(values);
    this.setState({
      isSubmitting: false,
      showCreationModal: false,
    });

    if (newFail instanceof Error) {
      alert(newFail);
      return;
    }

    this.setState((prevState) => ({
      fails: [...prevState.fails, newFail],
    }));
  };

  render() {
    const { fails, showCreationModal, isSubmitting } = this.state;

    return (
      <div className="tsw-page tar-batches">
        <DataTable data={fails} headers={failsFieldOptions} />
        <PlusButton
          onClick={() => this.setState({ showCreationModal: true })}
          testId="tar-fail-create-open"
        />
        <ControlledModalForm
          title="Create New Failcode"
          showModal={showCreationModal}
          handleSubmit={this.createFail}
          handleBack={() => this.setState({ showCreationModal: false })}
          inputData={failsInputData}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }
}

export default withRouter(TARFailsList);
