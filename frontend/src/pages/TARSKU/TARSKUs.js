/* eslint-disable camelcase */
import React, { Component } from 'react';
import { Modal, Tab, Tabs } from 'react-bootstrap';
import {
  TARProductCategoryService,
  TARSkuService,
} from '../../services/Services';
import ComponentTable from '../../components/ComponentTable';
import withRouter from '../../common/withRouter';
import OCSKUDetail from './OCSKUDetail';
import RMSKUDetail from './RMSKUDetail';
import FPSKUDetail from './FPSKUDetail';
import { BooleanCheckbox, CurrencyComponent, DateComponent } from './utils';
import PlusButton from '../../components/buttons/PlusButton';
import ControlledModalForm from '../../components/ControlledForm';

const commonSKUFieldOptions = {
  name: 'Name',
  created: {
    header: 'Created',
    body: DateComponent,
  },
  modified: {
    header: 'Modified',
    body: DateComponent,
  },
  stock_min: 'Stock Min',
  cost: {
    header: 'Cost',
    body: CurrencyComponent,
  },
  active: {
    header: 'Active',
    body: BooleanCheckbox,
  },
  special: {
    header: 'Special',
    body: BooleanCheckbox,
  },
  notes: 'Notes',
};

const TARSKUFieldOptions = {
  rmSku: {
    ...commonSKUFieldOptions,
    vendor_sku: 'Vendor SKU',
  },
  ocSku: {
    ...commonSKUFieldOptions,
    scratch: 'Scratch',
    dig: 'Dig',
    rm_sku: 'RM SKU',
  },
  fpSku: {
    ...commonSKUFieldOptions,
    category: 'Category',
    oc_sku: 'OC SKU',
  },
};

const RMSKUCreationInputData = () => ({
  name: {
    label: 'Name',
  },
  description: {
    label: 'Description',
  },
  location: {
    label: 'Location',
  },
  stock_min: {
    label: 'Stock Min',
    inputType: 'number',
  },
  cost: {
    label: 'Cost ($)',
    inputType: 'number',
  },
  active: {
    label: 'Active',
    inputType: 'checkbox',
  },
  special: {
    label: 'Special',
    inputType: 'checkbox',
  },
  qty: {
    label: 'Quantity',
    inputType: 'number',
  },
  notes: {
    label: 'Notes',
  },
  vendor_sku: {
    label: 'Vendor SKU',
    inputType: 'select',
    options: ['Loading...'],
  },
  min_trans_300: { label: 'Min. Transmission (300)', inputType: 'number' },
  min_trans_500: { label: 'Min. Transmission (500)', inputType: 'number' },
  min_trans_1385: {
    label: 'Min. Transmission (1385)',
    inputType: 'number',
  },
});

const OCSKUCreationInputData = () => ({
  name: {
    label: 'Name',
  },
  description: {
    label: 'Description',
  },
  location: {
    label: 'Location',
  },
  min_diameter_mm: {
    label: 'Minimum Diameter (mm)',
    inputType: 'number',
  },
  max_diameter_mm: {
    label: 'Maximum Diameter (mm)',
    inputType: 'number',
  },
  min_thickness_mm: {
    label: 'Minimum Thickness (mm)',
    inputType: 'number',
  },
  max_thickness_mm: {
    label: 'Maximum Thickness (mm)',
    inputType: 'number',
  },
  stock_min: {
    label: 'Stock Min',
    inputType: 'number',
  },
  cost: {
    label: 'Cost ($)',
    inputType: 'number',
  },
  active: {
    label: 'Active',
    inputType: 'checkbox',
  },
  special: {
    label: 'Special',
    inputType: 'checkbox',
  },
  notes: {
    label: 'Notes',
  },
  rm_sku: {
    label: 'RM SKU',
    inputType: 'select',
    options: ['Loading...'],
  },
  scratch: {
    label: 'Scratch',
    inputType: 'number',
  },
  dig: {
    label: 'Dig',
    inputType: 'number',
  },
});

const FPSKUCreationInputData = () => ({
  name: {
    label: 'Name',
  },
  description: {
    label: 'Description',
  },
  location: {
    label: 'Location',
  },
  stock_min: {
    label: 'Stock Min',
    inputType: 'number',
  },
  cost: {
    label: 'Cost ($)',
    inputType: 'number',
  },
  price: {
    label: 'Price ($)',
    inputType: 'number',
  },
  active: {
    label: 'Active',
    inputType: 'checkbox',
  },
  special: {
    label: 'Special',
    inputType: 'checkbox',
  },
  oc_sku: {
    label: 'OC SKU',
    inputType: 'select',
    options: ['Loading...'],
  },
  released: {
    label: 'Date Released',
    inputType: 'date',
  },
  category: {
    label: 'Category',
    inputType: 'select',
    options: ['Loading...'],
  },
  notes: {
    label: 'Notes',
  },
});

const OCSKUTransformer = (ocSku) => ({
  ...ocSku,
  diameter: { min: ocSku.min_diameter_mm, max: ocSku.max_diameter_mm },
  thickness: { min: ocSku.min_thickness_mm, max: ocSku.max_thickness_mm },
});

class TARSKUList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        rawmaterial: [],
        opticalcoat: [],
        finalproduct: [],
      },
      modalSKUType: null,
      showSKUDetailModal: false,
      showCreateModals: {
        rawmaterial: false,
        opticalcoat: false,
        finalproduct: false,
      },
      modalSKU: null,
      isSubmitting: false,
    };

    this.skuConfig = {
      rawmaterial: {
        title: 'Raw Material SKUs',
        acronym: 'RM',
        inputData: RMSKUCreationInputData(),
        fieldOptions: TARSKUFieldOptions.rmSku,
        endpoint: TARSkuService.createRawMaterial,
      },
      opticalcoat: {
        title: 'Optical Coat SKUs',
        acronym: 'OC',
        inputData: OCSKUCreationInputData(),
        fieldOptions: TARSKUFieldOptions.ocSku,
        endpoint: TARSkuService.createOpticalCoat,
      },
      finalproduct: {
        title: 'Final Product SKUs',
        acronym: 'FP',
        inputData: FPSKUCreationInputData(),
        fieldOptions: TARSKUFieldOptions.fpSku,
        endpoint: TARSkuService.createFinalProduct,
      },
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const [vendorSkus, rmSkus, ocSkus, fpSkus, categories] = await Promise.all([
      TARSkuService.getVendor(),
      TARSkuService.getRawMaterial(),
      TARSkuService.getOpticalCoat(),
      TARSkuService.getFinalProduct(),
      TARProductCategoryService.get(),
    ]);

    const sortSKUs = (skus) =>
      skus.sort((sku1, sku2) => sku1.name.localeCompare(sku2.name));

    const vendorSKUOptions = vendorSkus.map(({ name }) => name);
    const RMSKUOptions = rmSkus.map(({ name }) => name);
    const OCSKUOptions = ocSkus.map(({ name }) => name);
    const categoryOptions = categories.map(({ code }) => code);

    // Condense diameter and thickness into a single property each
    const transformedOCSKUS = ocSkus.map(OCSKUTransformer);

    // Sort OC SKUs by name
    const sortedRMSKUs = sortSKUs(rmSkus);
    const sortedOCSKUs = sortSKUs(transformedOCSKUS);
    const sortedFPSKUs = sortSKUs(fpSkus);

    this.skuConfig.rawmaterial.inputData.vendor_sku.options = [
      { text: 'Select One', value: '' },
      ...vendorSKUOptions,
    ];
    this.skuConfig.opticalcoat.inputData.rm_sku.options = [
      { text: 'Select One', value: '' },
      ...RMSKUOptions,
    ];
    this.skuConfig.finalproduct.inputData.oc_sku.options = [
      { text: 'Select One', value: '' },
      ...OCSKUOptions,
    ];
    this.skuConfig.finalproduct.inputData.category.options = [
      { text: 'Select One', value: '' },
      ...categoryOptions,
    ];

    this.setState({
      data: {
        rawmaterial: sortedRMSKUs,
        opticalcoat: sortedOCSKUs,
        finalproduct: sortedFPSKUs,
      },
    });
  };

  setDetailModalVisibility = (boolean) =>
    this.setState({ showSKUDetailModal: boolean });

  openModalWithSKU = (modalSKU, modalSKUType) =>
    this.setState({
      modalSKU,
      modalSKUType,
      showSKUDetailModal: true,
    });

  openModalBySKUNameAndType = (skuName, skuType) => {
    const skusToSearch = this.state.data[skuType];

    const foundSku = skusToSearch.find(({ name }) => name === skuName);
    if (!foundSku) return;
    this.openModalWithSKU(foundSku, skuType);
  };

  skuDisplay = (sku, type) => {
    const DetailComponent = {
      rawmaterial: RMSKUDetail,
      opticalcoat: OCSKUDetail,
      finalproduct: FPSKUDetail,
    }[type];
    const NavButton = {
      opticalcoat: this.RMNavButton,
      finalproduct: this.OCNavButton,
    }[type];
    return (
      <DetailComponent
        sku={sku}
        NavButton={NavButton}
        data-testid={`${type}-detail`}
      />
    );
  };

  OCNavButton = ({ value }) => {
    return (
      <button
        className="tar-sku-nav"
        type="button"
        onClick={() => this.openModalBySKUNameAndType(value, 'opticalcoat')}
      >
        {value}
      </button>
    );
  };

  RMNavButton = ({ value }) => {
    return (
      <button
        className="tar-sku-nav"
        type="button"
        onClick={() => this.openModalBySKUNameAndType(value, 'rawmaterial')}
      >
        {value}
      </button>
    );
  };

  createSKU = async (values, skuType) => {
    this.setState({ isSubmitting: true });

    const valueArr = Object.entries(values);
    const strippedValues = Object.fromEntries(
      valueArr.filter(([, value]) => value !== '')
    );

    let newSKU = await this.skuConfig[skuType].endpoint(strippedValues);
    this.setState({ isSubmitting: false });
    if (newSKU instanceof Error) {
      alert(newSKU);
      return;
    }

    // Update OC RM SKU list after creation
    if (skuType === 'rawmaterial') {
      this.skuConfig.opticalcoat.inputData.rm_sku.options.push(newSKU.name);
    }

    // Transform diameter and thickness data in the OC case
    // and update FP SKU list
    if (skuType === 'opticalcoat') {
      this.skuConfig.finalproduct.inputData.oc_sku.options.push(newSKU.name);
      newSKU = OCSKUTransformer(newSKU);
    }

    this.setState((prevState) => ({
      data: {
        ...prevState.data,
        [skuType]: [...prevState.data[skuType], newSKU],
      },
      showCreateModals: { ...prevState.showCreateModals, [skuType]: false },
    }));
  };

  openCreationForm = (skuKey) => {
    this.setState((prevState) => ({
      showCreateModals: { ...prevState.showCreateModals, [skuKey]: true },
    }));
  };

  render() {
    const { modalSKUType, showSKUDetailModal, modalSKU } = this.state;
    const skuConfigArray = Object.entries(this.skuConfig);

    return (
      <div className="tsw-page tar-skus">
        <Tabs defaultActiveKey="rawmaterial" style={{ width: '100%' }} justify>
          {skuConfigArray.map(([skuKey, { fieldOptions, title }]) => {
            const skuData = this.state.data[skuKey];
            return (
              <Tab
                key={skuKey}
                title={title}
                eventKey={skuKey}
                className="mx-2 my-1"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3>
                    {title} ({skuData.length})
                  </h3>
                  <PlusButton
                    onClick={() => this.openCreationForm(skuKey)}
                    testId={`tar-${skuKey}-create-open`}
                  />
                </div>
                <ComponentTable
                  data-testid={`${skuKey}-table`}
                  data={skuData}
                  fieldOptions={fieldOptions}
                  rowProps={(sku) => ({
                    className: 'clickable-row',
                    onClick: () => this.openModalWithSKU(sku, skuKey),
                  })}
                />
              </Tab>
            );
          })}
        </Tabs>
        <Modal
          size="lg"
          centered
          show={showSKUDetailModal}
          onHide={() => this.setDetailModalVisibility(false)}
        >
          {modalSKU
            ? this.skuDisplay(modalSKU, modalSKUType)
            : 'Error Selecting SKU'}
        </Modal>
        {skuConfigArray.map(([skuKey, { acronym, inputData }]) => (
          <ControlledModalForm
            key={skuKey}
            centered
            title={`Create New ${acronym} SKU`}
            inputData={inputData}
            handleSubmit={(values) => this.createSKU(values, skuKey)}
            showModal={this.state.showCreateModals[skuKey]}
            handleBack={() =>
              this.setState((prevState) => ({
                showCreateModals: {
                  ...prevState.showCreateModals,
                  [skuKey]: false,
                },
              }))
            }
            isSubmitting={this.state.isSubmitting}
          />
        ))}
      </div>
    );
  }
}

export default withRouter(TARSKUList);
