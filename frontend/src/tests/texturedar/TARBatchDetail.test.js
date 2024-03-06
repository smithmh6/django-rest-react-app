import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TARBatchDetail from '../../pages/TARBatch/Detail';
import {
  TARBatchService,
  TARFailcodesService,
  TARSkuService,
  TARStepService,
} from '../../services/Services';
import ExampleData from '../../data/ExampleData';

// Mock services
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/Services');

describe('TARBatchDetail', () => {
  const exampleTarBatches = ExampleData.tar.batches;
  const testBatch = exampleTarBatches[0];
  const testSteps = ExampleData.tar.steps;
  const testParts = ExampleData.tar.parts[0];
  const testOCSKUs = ExampleData.tar.ocSkus;
  const testFails = ExampleData.tar.fails;

  const renderPage = () => {
    render(
      <MemoryRouter initialEntries={[`/${testBatch.id}`]}>
        <Routes>
          <Route path="/:id" element={<TARBatchDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  function mockServicesUnresolved() {
    const unresolvedPromise = new Promise(() => {});
    TARStepService.get.mockReturnValue(unresolvedPromise);
    TARBatchService.get.mockReturnValue(unresolvedPromise);
    TARBatchService.getParts.mockReturnValue(unresolvedPromise);
    TARSkuService.getOpticalCoat.mockReturnValue(unresolvedPromise);
    TARFailcodesService.get.mockReturnValue(unresolvedPromise);
  }

  const renderWithMocks = () => {
    TARStepService.get.mockReturnValue(testSteps);
    TARBatchService.get.mockReturnValue(testBatch);
    TARBatchService.getParts.mockReturnValue(testParts);
    TARSkuService.getOpticalCoat.mockReturnValue(testOCSKUs);
    TARFailcodesService.get.mockReturnValue(testFails);
    renderPage();
  };

  test('renders without error', () => {
    mockServicesUnresolved();
    renderPage();
  });

  test('calls expected endpoints', () => {
    const idString = String(testBatch.id);
    mockServicesUnresolved();
    renderPage();
    expect(TARBatchService.get).toBeCalledWith(idString);
    expect(TARBatchService.getParts).toBeCalledWith(idString);
    expect(TARFailcodesService.get).toBeCalled();
    expect(TARSkuService.getOpticalCoat).toBeCalled();
    expect(TARStepService.get).toBeCalled();
  });

  test('renders steps', async () => {
    TARStepService.get.mockReturnValue(testSteps);
    renderPage();

    await Promise.all(
      testSteps.map(async (step) => {
        await screen.findByText(step.name);
      })
    );
  });

  test('renders batch name', async () => {
    TARStepService.get.mockReturnValue(testSteps);
    TARBatchService.get.mockReturnValue(testBatch);
    renderPage();

    await screen.findByText(testBatch.name);
  });

  test('renders part serials', async () => {
    TARStepService.get.mockReturnValue(testSteps);
    TARBatchService.getParts.mockReturnValue(testParts);
    renderPage();
    await Promise.all(
      testParts.map(async (part) => {
        await screen.findByText(part.serial);
      })
    );
  });

  test('save button calls update on service', async () => {
    renderWithMocks();
    const user = userEvent.setup();
    const saveButton = screen.getByText('Save Data');

    expect(TARBatchService.update).not.toBeCalled();
    await user.click(saveButton);
    expect(TARBatchService.update).toBeCalled();
  });

  test('previous step button calls update on service', async () => {
    renderWithMocks();
    const user = userEvent.setup();
    const prevButton = screen.getByText('Previous Step');

    expect(TARBatchService.update).not.toBeCalled();
    await user.click(prevButton);
    expect(TARBatchService.update).toBeCalled();
  });

  test('next step button calls update on service', async () => {
    renderWithMocks();
    const user = userEvent.setup();
    const nextButton = screen.getByText('Next Step');

    expect(TARBatchService.update).not.toBeCalled();
    await user.click(nextButton);
    expect(TARBatchService.update).toBeCalled();
  });
});
