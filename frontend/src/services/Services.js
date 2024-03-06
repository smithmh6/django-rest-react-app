/* eslint-disable camelcase */
import { makeRequest, makeHandledRequest, mockRequest } from './Request';
import { nextBatchNumber } from '../common/Utils';
import exampleData from '../data/ExampleData';

export default function serviceBuilder(endpoint) {
  const get = async (id) => {
    const suffix = id ? `${id}/` : '';
    return makeHandledRequest('GET', endpoint + suffix);
  };
  const create = async (data) => makeHandledRequest('POST', endpoint, data);
  const update = async (id, data) => {
    return makeHandledRequest('PATCH', `${endpoint + id}/`, data);
  };

  return { get, create, update };
}

const TARBatchService = (() => {
  const url = '/batches/textured_ar/';
  const batchService = serviceBuilder(url);

  // Will need to change URL once API is up
  const getOpen = async () => makeHandledRequest('GET', `${url}open/`);

  const getNextNumber = async () => {
    try {
      const highestBatch = await makeRequest('GET', `${url}highest/`);
      return nextBatchNumber(highestBatch.name);
    } catch (error) {
      console.error('Unable to fetch highest batch number');
      return '';
    }
  };

  const urlForPart = (id) => `${url + id}/parts/`;
  const getParts = async (id) => {
    if (!id) return Error('getParts called with batch ID ', id);
    return makeHandledRequest('GET', urlForPart(id));
  };

  const updateParts = async (id, newParts) =>
    makeHandledRequest('PATCH', urlForPart(id), newParts);

  return {
    ...batchService,
    getOpen,
    getNextNumber,
    getParts,
    updateParts,
  };
})();

const MockedTARBatchService = (() => {
  const get = async (id) => {
    if (!id && id !== 0) return TARBatchService.get();
    return mockRequest(exampleData.tar.batches[id]);
  };

  const getNextNumber = async () => {
    return mockRequest('TAR000005');
  };

  const create = (batchData) => {
    const { name, batch_type, sku_object_id, order_no, qty, notes } = batchData;

    const batchToReturn = {
      name,
      batch_type,
      sku_object_id: Number(sku_object_id),
      order_no,
      qty,
      notes,
      fails: 0,
      step_object_id: 1,
    };

    return mockRequest(batchToReturn);
  };

  const update = (id, data) => {
    const updatePartWithStep = (part, step) =>
      part.fail1_object_id === 1 ? { ...part, step_object_id: step } : part;

    const updatedParts = data.parts.map((part) =>
      updatePartWithStep(part, data.step_object_id)
    );

    const toReturn = {
      ...data,
      parts: updatedParts,
      fails: updatedParts.filter((part) => part.fail !== 'None').length,
    };

    return mockRequest(toReturn);
  };

  const getParts = async (id) => mockRequest(exampleData.tar.parts[id]);
  const updateParts = async (id, newParts) => mockRequest(newParts);

  return {
    ...TARBatchService,
    mock: {
      get,
      getParts,
      getNextNumber,
      update,
      updateParts,
      create,
    },
  };
})();

const TARStepService = (() => {
  const url = '/steps/textured_ar/';
  return serviceBuilder(url);
})();

const MockedTARStepService = (() => {
  const get = async () => mockRequest(exampleData.tar.steps);

  return {
    ...TARStepService,
    mock: { get },
  };
})();

const TARSkuService = (() => {
  const url = '/skus/textured_ar/';
  const service = serviceBuilder(url);

  const getVendor = async (id) => {
    const suffix = id ? `${id}/` : '';
    return makeHandledRequest('get', `${url}vendor/${suffix}`);
  };

  const getRawMaterial = async (id) => {
    const suffix = id ? `${id}/` : '';
    return makeHandledRequest('get', `${url}rawmaterial/${suffix}`);
  };

  const getOpticalCoat = async (id) => {
    const suffix = id ? `${id}/` : '';
    return makeHandledRequest('GET', `${url}opticalcoat/${suffix}`);
  };

  const getFinalProduct = async (id) => {
    const suffix = id ? `${id}/` : '';
    return makeHandledRequest('GET', `${url}finalproduct/${suffix}`);
  };

  const getByContentType = async (contentType, id) => {
    if (contentType === 'finalproduct') return getFinalProduct(id);
    if (contentType === 'opticalcoat') return getOpticalCoat(id);
    return Error('Unknown content type: ', contentType);
  };

  const getShippableParts = async (skuType, skuID) => {
    return makeHandledRequest(
      'GET',
      `/skus/textured_ar/${skuType}/${skuID}/parts/shippable/`
    );
  };

  const createRawMaterial = async (data) => {
    return makeHandledRequest('POST', `${url}rawmaterial/`, data);
  };

  const createOpticalCoat = async (data) => {
    return makeHandledRequest('POST', `${url}opticalcoat/`, data);
  };

  const createFinalProduct = async (data) => {
    return makeHandledRequest('POST', `${url}finalproduct/`, data);
  };

  return {
    ...service,
    getVendor,
    getRawMaterial,
    getOpticalCoat,
    getFinalProduct,
    getByContentType,
    getShippableParts,
    createRawMaterial,
    createOpticalCoat,
    createFinalProduct,
  };
})();

const MockedTARSkuService = (() => {
  const exampleSkus = exampleData.tar.skus;

  const get = async () => mockRequest(exampleSkus);

  const getShippableParts = async (skuType, skuName) => {
    console.log('Called mock with type ', skuType, ' and name ', skuName);
    return mockRequest(exampleData.tar.parts[0]);
  };

  return {
    ...TARSkuService,
    mock: { get, getShippableParts },
  };
})();

const TARProductCategoryService = serviceBuilder('/categories/textured_ar/');

const ReticleSkuService = (() => {
  const url = '/skus/reticle/';
  const service = serviceBuilder(url);

  const getFinalProduct = async (id) => {
    const suffix = id ? `${id}/` : '';
    return makeHandledRequest('GET', `${url}finalproduct/${suffix}`);
  };

  const getShippableParts = async (skuType, skuID) => {
    return makeHandledRequest(
      'GET',
      `/skus/reticle/${skuType}/${skuID}/parts/shippable/`
    );
  };

  return {
    ...service,
    getFinalProduct,
    getShippableParts,
  };
})();

const ReticleStepService = serviceBuilder('/steps/reticle');

const ShipmentService = (() => {
  const url = '/shipping/shipments/';
  const service = serviceBuilder(url);

  const getOpen = async () => {
    return makeHandledRequest('GET', `${url}open/`);
  };

  const getParts = async (id) => {
    return makeHandledRequest('GET', `${url}${id}/parts/`);
  };

  const updateOpen = async (data) => {
    return makeHandledRequest('PATCH', `${url}open/`, data);
  };

  const updateParts = async (id, data) => {
    return makeHandledRequest('PATCH', `${url}${id}/parts/`, data);
  };

  return {
    ...service,
    getOpen,
    getParts,
    updateOpen,
    updateParts,
  };
})();

const MockedShipmentService = (() => {
  const get = (id) => {
    if (id) return exampleData.purchasing.shipments[id];
    return exampleData.purchasing.shipments;
  };

  const getOpen = () => exampleData.purchasing.shipments;

  const create = (shipment) => {
    console.log('Called mock create() with shipment data: ', shipment);
    return shipment;
  };

  const update = (id, shipment) => {
    console.log(
      'Called ShipmentService update() with shipment data: ',
      shipment
    );
    return mockRequest(shipment);
  };

  const updateParts = (id, parts) => {
    console.log('Called ShipmentService updateParts with part data: ', parts);
    return mockRequest(parts);
  };

  const getParts = async () => {
    return exampleData.tar.parts[0];
  };

  return {
    ...ShipmentService,
    mock: {
      get,
      getOpen,
      getParts,
      create,
      update,
      updateParts,
    },
  };
})();

const CommonSKUService = {
  getShippableParts: (skuContentType, skuID) => {
    if (skuContentType === '126')
      return TARSkuService.getShippableParts('opticalcoat', skuID);
    if (skuContentType === '124')
      return TARSkuService.getShippableParts('finalproduct', skuID);
    if (skuContentType === '179')
      return ReticleSkuService.getShippableParts('finalproduct', skuID);
    return Error('Unrecognized SKU content type: ', skuContentType);
  },

  getByContentType: (skuContentType, skuID) => {
    if (skuContentType === '126') return TARSkuService.getOpticalCoat(skuID);
    if (skuContentType === '124') return TARSkuService.getFinalProduct(skuID);
    if (skuContentType === '179')
      return ReticleSkuService.getFinalProduct(skuID);
    return Error('Unrecognized SKU content type: ', skuContentType);
  },
};

const RieSystemService = serviceBuilder('/textured_ar/riesystems/');
const EtchRecipeService = serviceBuilder('/textured_ar/etchrecipes/');
const RieToolingService = serviceBuilder('/textured_ar/rietoolings/');
const TARFailcodesService = serviceBuilder('/failcodes/textured_ar/');
const WarehouseService = serviceBuilder('/shipping/warehouses/');
const ShippingStatusService = serviceBuilder('/shipping/statuses/');

export {
  MockedTARBatchService as TARBatchService,
  MockedTARStepService as TARStepService,
  MockedShipmentService as ShipmentService,
  MockedTARSkuService as TARSkuService,
  CommonSKUService,
  ReticleSkuService,
  ReticleStepService,
  RieSystemService,
  TARProductCategoryService,
  EtchRecipeService,
  RieToolingService,
  TARFailcodesService,
  WarehouseService,
  ShippingStatusService,
};
