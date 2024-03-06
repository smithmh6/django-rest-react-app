import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TARBatchList from '../../pages/TARBatch/List';
import {
  EtchRecipeService,
  RieToolingService,
  TARBatchService,
  TARSkuService,
  TARStepService,
} from '../../services/Services';
import ExampleData from '../../data/ExampleData';

// Mock services
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/Services');

const exampleTarBatches = ExampleData.tar.batches;
const exampleOCSKUs = ExampleData.tar.ocSkus;

// ID just needs to be unique from batches in exampleData
const uniqueID = 9;

describe('TARBatchList', () => {
  const renderTarBatches = () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TARBatchList />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders correct text with no open batches', async () => {
    TARBatchService.getOpen.mockReturnValueOnce([]);
    TARSkuService.getOpticalCoat.mockReturnValueOnce([]);
    EtchRecipeService.get.mockReturnValueOnce([]);
    RieToolingService.get.mockReturnValueOnce([]);

    renderTarBatches();

    await screen.findByText('No Open Batches');
  });

  test('renders correct text on error', async () => {
    const errorMessage = 'Error Fetching Batches';
    TARBatchService.getOpen.mockReturnValueOnce(Error(errorMessage));
    TARSkuService.getOpticalCoat.mockReturnValueOnce([]);
    EtchRecipeService.get.mockReturnValueOnce([]);
    RieToolingService.get.mockReturnValueOnce([]);

    renderTarBatches();

    await screen.findByText(errorMessage);
  });

  test('renders raw batch data correctly', async () => {
    const batchToSend = exampleTarBatches[0];

    TARBatchService.getOpen.mockReturnValueOnce([batchToSend]);
    TARSkuService.getOpticalCoat.mockReturnValueOnce(exampleOCSKUs);
    EtchRecipeService.get.mockReturnValueOnce([]);
    RieToolingService.get.mockReturnValueOnce([]);

    renderTarBatches();

    // Check that all expected elements render
    await screen.findByText(batchToSend.name);
    await screen.findByText(batchToSend.batch_type);
    await screen.findByText(batchToSend.order_no);
    await screen.findByText(batchToSend.qty);
    await screen.findByText(batchToSend.fails);
    await screen.findByText(batchToSend.notes);
  });

  test('renders content type data correctly', async () => {
    const batchToSend = exampleTarBatches[0];
    const batchSku = {
      id: batchToSend.sku_object_id,
      name: 'Example Sku Name',
    };
    const batchStep = {
      id: batchToSend.step_object_id,
      name: 'Example Step Name',
    };

    TARBatchService.getOpen.mockReturnValue([batchToSend]);
    TARSkuService.getOpticalCoat.mockReturnValue([batchSku]);
    TARStepService.get.mockReturnValue([batchStep]);
    EtchRecipeService.get.mockReturnValueOnce([]);
    RieToolingService.get.mockReturnValueOnce([]);

    renderTarBatches();

    await screen.findByText(batchSku.name);
    await screen.findByText(batchStep.name);
  });

  test('does not render form initially', async () => {
    TARBatchService.getOpen.mockReturnValueOnce([]);
    TARSkuService.getOpticalCoat.mockReturnValueOnce([]);
    EtchRecipeService.get.mockReturnValueOnce([]);
    RieToolingService.get.mockReturnValueOnce([]);

    renderTarBatches();

    const formTitle = screen.queryByText('New TAR Batch');
    expect(formTitle).toBeNull();

    await screen.findByTestId('openTarBatchForm');
  });

  describe('on plus button press', () => {
    const testOCSKUs = ExampleData.tar.ocSkus;
    const testRecipes = ExampleData.tar.recipes;
    const testToolings = ExampleData.tar.toolings;

    const setup = async () => {
      TARBatchService.getOpen.mockReturnValueOnce([]);
      TARBatchService.getNextNumber.mockReturnValueOnce('TAR000123');
      TARSkuService.getOpticalCoat.mockReturnValue(testOCSKUs);
      EtchRecipeService.get.mockReturnValue(testRecipes);
      RieToolingService.get.mockReturnValue(testToolings);
      renderTarBatches();
      const user = userEvent.setup();
      const plusButton = await screen.findByTestId('openTarBatchForm');

      await user.click(plusButton);

      return { user };
    };

    test('form title is rendered', async () => {
      await setup();
      await screen.findByText('New TAR Batch');
    });

    test('hides form on back button click', async () => {
      const { user } = await setup();

      const backButton = await screen.findByText('Back');
      await user.click(backButton);

      const formTitle = screen.queryByText('New TAR Batch');
      expect(formTitle).toBeNull();
    });

    test('hides form on create button click', async () => {
      const { user } = await setup();
      TARBatchService.create.mockReturnValueOnce({ id: uniqueID });

      const createButton = await screen.findByText('Create');
      await user.click(createButton);
      await new Promise((r) => {
        setTimeout(r, 2000);
      });
      const formTitle = screen.queryByText('New TAR Batch');
      expect(formTitle).toBeNull();
    });

    test('renders correct default batch number', async () => {
      await setup();
      await screen.findByDisplayValue('TAR000123');
    });

    test('renders correct list of OC SKUs', async () => {
      await setup();
      await screen.findByDisplayValue('TAR000123');
    });

    test('calls the create service with optional fields omitted when blank', async () => {
      const { user } = await setup();
      // Pass ID to avoid key error
      TARBatchService.create.mockReturnValueOnce({ id: uniqueID });
      const typedBatchNo = 'TAR000101';
      const batchTypeChoice = 'DEVELOPMENT';

      const skuToSelect = testOCSKUs[0];
      const recipeToSelect = testRecipes[1];
      const toolingToSelect = testToolings[1];

      const batchNoInput = await screen.findByLabelText('Batch Number');
      await user.clear(batchNoInput);
      await user.type(batchNoInput, typedBatchNo);

      const orderNoInput = await screen.findByLabelText('Order No.');
      await user.type(orderNoInput, 'TBD');

      const batchTypeButton = await screen.findByText(batchTypeChoice);
      await user.click(batchTypeButton);

      const ocSkuSelect = await screen.findByLabelText('OC SKU');
      await user.selectOptions(ocSkuSelect, skuToSelect.name);

      const partQtyInput = await screen.findByLabelText('Part Qty');
      await user.type(partQtyInput, '30');

      const etchRecipeSelect = await screen.findByLabelText('Etch Recipe');
      await user.selectOptions(etchRecipeSelect, recipeToSelect.name);

      const rieToolingSelect = await screen.findByLabelText('RIE Tooling');
      await user.selectOptions(rieToolingSelect, toolingToSelect.code);

      const createButton = await screen.findByText('Create');
      await user.click(createButton);

      expect(TARBatchService.create).toBeCalledWith({
        name: typedBatchNo,
        batch_type: 'DEVELOPMENT',
        sku_object_id: String(skuToSelect.id),
        recipe: String(recipeToSelect.id),
        tooling: String(toolingToSelect.id),
        qty: '30',
        order_no: 'TBD',
      });
    });

    test('calls the create service with all fields correctly', async () => {
      const { user } = await setup();
      TARBatchService.create.mockReturnValueOnce({ id: uniqueID });
      const typedBatchNo = 'TAR000101';
      const batchTypeChoice = 'DEVELOPMENT';

      const skuToSelect = testOCSKUs[0];
      const recipeToSelect = testRecipes[0];
      const toolingToSelect = testToolings[0];

      const batchNoInput = await screen.findByLabelText('Batch Number');
      await user.clear(batchNoInput);
      await user.type(batchNoInput, typedBatchNo);

      const orderNoInput = await screen.findByLabelText('Order No.');
      await user.type(orderNoInput, 'TBD');

      const batchTypeButton = await screen.findByText(batchTypeChoice);
      await user.click(batchTypeButton);

      const ocSkuSelect = await screen.findByLabelText('OC SKU');
      await user.selectOptions(ocSkuSelect, skuToSelect.name);

      const partQtyInput = await screen.findByLabelText('Part Qty');
      await user.type(partQtyInput, '30');

      const etchRecipeSelect = await screen.findByLabelText('Etch Recipe');
      await user.selectOptions(etchRecipeSelect, recipeToSelect.name);

      const rieToolingSelect = await screen.findByLabelText('RIE Tooling');
      await user.selectOptions(rieToolingSelect, toolingToSelect.code);

      const notesInput = await screen.findByLabelText('Notes');
      await user.type(notesInput, 'my notes');

      const createButton = await screen.findByText('Create');
      await user.click(createButton);

      expect(TARBatchService.create).toBeCalledWith({
        name: typedBatchNo,
        batch_type: 'DEVELOPMENT',
        sku_object_id: String(skuToSelect.id),
        recipe: String(recipeToSelect.id),
        tooling: String(toolingToSelect.id),
        qty: '30',
        order_no: 'TBD',
        notes: 'my notes',
      });
    });

    test('renders batch info returned from create service', async () => {
      const { user } = await setup();
      const baseBatch = ExampleData.tar.batches[0];

      // eslint-disable-next-line camelcase
      const { name, fails, qty, order_no, batch_type, notes } = baseBatch;

      const batchToReturn = {
        id: uniqueID,
        name,
        fails,
        qty,
        // eslint-disable-next-line camelcase
        order_no,
        // eslint-disable-next-line camelcase
        batch_type,
        notes,
      };

      TARBatchService.create.mockReturnValueOnce(batchToReturn);
      const createButton = await screen.findByText('Create');
      await user.click(createButton);

      await screen.findByText(batchToReturn.name);
      await screen.findByText(batchToReturn.fails);
      await screen.findByText(batchToReturn.qty);
      await screen.findByText(batchToReturn.order_no);
      await screen.findByText(batchToReturn.batch_type);
      await screen.findByText(batchToReturn.notes);
    });
  });
});
