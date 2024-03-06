import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ShipmentDetail from '../../pages/Shipment/Detail';
import {
  ShipmentService,
  ShippingStatusService,
  TARSkuService,
  TARStepService,
} from '../../services/Services';
import ExampleData from '../../data/ExampleData';

// Mock services
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/Services');

const testStatuses = ExampleData.shipping.statuses;
const testShipment = ExampleData.purchasing.shipments[0];
const testSteps = ExampleData.tar.steps;
const testParts = ExampleData.tar.parts[0];
const testOCSKUs = ExampleData.tar.ocSkus;
const testFPSKUs = ExampleData.tar.fpSkus;
const idString = String(testShipment.id);

describe('ShipmentDetail page', () => {
  function renderPage() {
    render(
      <MemoryRouter initialEntries={[`/${testShipment.id}`]}>
        <Routes>
          <Route path="/:id" element={<ShipmentDetail />} />
        </Routes>
      </MemoryRouter>
    );
  }

  function mockServicesUnresolved() {
    const unresolvedPromise = new Promise(() => {});
    ShipmentService.get.mockReturnValue(unresolvedPromise);
    ShipmentService.getParts.mockReturnValue(unresolvedPromise);
    ShippingStatusService.get.mockReturnValue(unresolvedPromise);
    TARSkuService.getOpticalCoat.mockReturnValue(unresolvedPromise);
    TARSkuService.getFinalProduct.mockReturnValue(unresolvedPromise);
    TARStepService.get.mockReturnValue(unresolvedPromise);
  }

  function mockServices() {
    ShipmentService.get.mockReturnValue(testShipment);
    ShipmentService.getParts.mockReturnValue(testParts);
    ShippingStatusService.get.mockReturnValue(testStatuses);
    TARSkuService.getOpticalCoat.mockReturnValue(testOCSKUs);
    TARSkuService.getFinalProduct.mockReturnValue(testFPSKUs);
    TARStepService.get.mockReturnValue(testSteps);
  }

  const renderPageWithMocks = () => {
    mockServices();
    renderPage();
  };

  test('renders without error', () => {
    mockServicesUnresolved();
    renderPage();
  });

  test('calls appropriate endpoints', () => {
    mockServicesUnresolved();
    renderPage();
    expect(ShipmentService.get).toBeCalledWith(idString);
    expect(ShipmentService.getParts).toBeCalledWith(idString);
    expect(ShippingStatusService.get).toBeCalled();
    expect(TARSkuService.getOpticalCoat).toBeCalled();
    expect(TARSkuService.getFinalProduct).toBeCalled();
    expect(TARStepService.get).toBeCalled();
  });

  test('renders basic shipment information', async () => {
    renderPageWithMocks();
    await screen.findByText(idString);
    await screen.findByText(testShipment.qty);
    await screen.findByDisplayValue(testShipment.transfer);
    await screen.findByDisplayValue(testShipment.tracking);
  });

  test('renders part serials', async () => {
    renderPageWithMocks();

    await Promise.all(
      testParts.map(async (part) => {
        await screen.findByText(part.serial);
      })
    );
  });

  test('save button is disabled on load and enabled after', async () => {
    renderPageWithMocks();
    const saveButton = screen.getByText('Save Data');
    expect(saveButton).toBeDisabled();
    await screen.findByText(testShipment.id);
    expect(saveButton).not.toBeDisabled();
  });

  test('save button calls appropriate endpoints', async () => {
    renderPageWithMocks();
    const saveButton = screen.getByText('Save Data');
    await waitFor(() => expect(saveButton).not.toBeDisabled());
    const user = userEvent.setup();
    await user.click(saveButton);

    expect(ShipmentService.update).toBeCalled();
    expect(ShipmentService.updateParts).toBeCalled();
  });
});
