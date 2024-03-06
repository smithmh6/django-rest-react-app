import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ShipmentService,
  ShippingStatusService,
  TARSkuService,
  WarehouseService,
  CommonSKUService,
} from '../../services/Services';
import exampleData from '../../data/ExampleData';
import ShipmentCreate from '../../pages/Shipment/Create';

// Mock services and authConfig
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/Services');
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn,
  useParams: jest.fn,
  useNavigate: jest.fn,
}));

// Mock window functions
window.alert = jest.fn();
window.confirm = jest.fn();

describe('ShipmentCreate page', () => {
  const skuSelectWarningText =
    'Select a SKU and click Search to see available parts';
  const invalidQuantityWarningText = 'Please enter a valid number of parts';

  function renderPage() {
    render(<ShipmentCreate />);
  }

  const { warehouses } = exampleData;
  const { statuses } = exampleData.shipping;
  const { ocSkus, fpSkus } = exampleData.tar;
  const testParts = exampleData.tar.parts[0];

  function mockServicesUnresolved() {
    const unresolvedPromise = new Promise(() => {});
    TARSkuService.getOpticalCoat.mockReturnValue(unresolvedPromise);
    TARSkuService.getFinalProduct.mockReturnValue(unresolvedPromise);
    TARSkuService.getShippableParts.mockReturnValue(unresolvedPromise);
    WarehouseService.get.mockReturnValue(unresolvedPromise);
    ShippingStatusService.get.mockReturnValue(unresolvedPromise);
  }

  function mockServices() {
    // Workaround: re-implement CommonSKUService.

    TARSkuService.getOpticalCoat.mockReturnValue(ocSkus);
    TARSkuService.getFinalProduct.mockReturnValue(fpSkus);
    CommonSKUService.getShippableParts.mockReturnValue(testParts);
    TARSkuService.getShippableParts.mockReturnValue(testParts);
    WarehouseService.get.mockReturnValue(warehouses);
    ShippingStatusService.get.mockReturnValue(statuses);
  }

  async function searchForParts() {
    mockServices();
    renderPage();
    const user = userEvent.setup();

    const select = screen.getByLabelText('SKU Name');
    await waitFor(() => expect(select).not.toHaveDisplayValue('Loading...'));
    await user.selectOptions(select, ocSkus[0].name);

    const searchButton = screen.getByText('Search');
    await user.click(searchButton);
    return user;
  }

  test('renders SKU search info message by default', () => {
    mockServicesUnresolved();
    renderPage();
    screen.getByText(skuSelectWarningText);
  });

  test('Fetched inputs render loading initially', () => {
    mockServicesUnresolved();
    renderPage();

    const skuNameSelect = screen.getByLabelText('SKU Name');
    expect(skuNameSelect).toHaveDisplayValue('Loading...');

    const warehouseSelect = screen.getByLabelText('Warehouse');
    expect(warehouseSelect).toHaveDisplayValue('Loading...');

    const statusSelect = screen.getByLabelText('Status');
    expect(statusSelect).toHaveDisplayValue('Loading...');
  });

  test('calls expected endpoints', () => {
    mockServicesUnresolved();
    renderPage();
    expect(TARSkuService.getOpticalCoat).toBeCalled();
    expect(TARSkuService.getFinalProduct).toBeCalled();
    expect(WarehouseService.get).toBeCalled();
    expect(ShippingStatusService.get).toBeCalled();
  });

  test('SKU input renders only OC SKU options initially', async () => {
    mockServices();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('SKU Name')).not.toHaveDisplayValue(
        'Loading...'
      )
    );
    ocSkus.forEach((sku) => screen.getByRole('option', { name: sku.name }));
    fpSkus.forEach((sku) =>
      expect(screen.queryByRole('option', { name: sku.name })).toBeNull()
    );
  });

  test('SKU input renders only FP SKUs when toggle is changed', async () => {
    mockServices();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText('SKU Name')).not.toHaveDisplayValue(
        'Loading...'
      )
    );

    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText('SKU Type'), 'FP');

    fpSkus.forEach((sku) => screen.getByRole('option', { name: sku.name }));
    ocSkus.forEach((sku) =>
      expect(screen.queryByRole('option', { name: sku.name })).toBeNull()
    );
  });

  test('Search button click calls endpoint with appropriate form data', async () => {
    mockServices();
    renderPage();
    const user = userEvent.setup();
    const skuNameSelect = screen.getByLabelText('SKU Name');

    await waitFor(() =>
      expect(skuNameSelect).not.toHaveDisplayValue('Loading...')
    );

    await user.click(skuNameSelect);

    const skuToSelect = ocSkus[0];

    await screen.findByRole('option', { name: skuToSelect.name });

    await user.selectOptions(skuNameSelect, skuToSelect.name);

    const searchButton = screen.getByText('Search');
    await user.click(searchButton);
    expect(CommonSKUService.getShippableParts).toBeCalledWith(
      '126',
      String(skuToSelect.id)
    );
  });

  test('renders appropriate part data after searching', async () => {
    await searchForParts();
    testParts.forEach((part) => screen.getByText(part.serial));
  });

  test('does not render warning when parts are returned', async () => {
    await searchForParts();
    expect(screen.queryByText(skuSelectWarningText)).toBeNull();
  });

  test('renders warning when quantity is invalid', async () => {
    await searchForParts();
    screen.getByText(invalidQuantityWarningText);
  });

  test('disables create button when quantity is invalid', async () => {
    await searchForParts();
    const createButton = screen.getByText('Create Shipment');
    expect(createButton).toBeDisabled();
  });

  test('shows selection display when quantity is valid', async () => {
    const user = await searchForParts();
    const requestedQuantity = '8';
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, requestedQuantity);
    screen.getByText(`0 of ${requestedQuantity} selected`);
    screen.getByText(`Autoselect First ${requestedQuantity}`);
  });

  test('does not render warning when quantity is valid', async () => {
    const user = await searchForParts();
    const requestedQuantity = '8';
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, requestedQuantity);
    expect(screen.queryByText(invalidQuantityWarningText)).toBeNull();
  });

  test('calls alert when too few parts for autoselect', async () => {
    const user = await searchForParts();
    const requestedQuantity = String(testParts.length + 1);
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, requestedQuantity);

    const autoselectButton = screen.getByText(
      `Autoselect First ${requestedQuantity}`
    );
    await user.click(autoselectButton);
    expect(window.alert).toBeCalled();
  });

  test('calls endpoint on create button click with valid autoselection', async () => {
    const user = await searchForParts();
    const requestedQuantity = String(testParts.length);
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, requestedQuantity);

    const autoselectButton = screen.getByText(
      `Autoselect First ${requestedQuantity}`
    );
    const createButton = screen.getByText('Create Shipment');

    expect(createButton).not.toBeDisabled();
    await user.click(autoselectButton);
    await user.click(createButton);
    expect(ShipmentService.create).toBeCalledTimes(1);
  });

  test('calls endpoint on create button click with correct number selected', async () => {
    const user = await searchForParts();
    const requestedQuantity = String(testParts.length);
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, requestedQuantity);
    const createButton = screen.getByText('Create Shipment');

    await testParts.forEach(async (part) => {
      await user.click(screen.getByText(part.serial));
    });
    await user.click(createButton);
    expect(ShipmentService.create).toBeCalledTimes(1);
  });

  test("doesn't call endpoint on create button click with incorrect number selected", async () => {
    window.confirm.mockReturnValue(false);
    const user = await searchForParts();
    const requestedQuantity = String(testParts.length);
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, requestedQuantity);
    const createButton = screen.getByText('Create Shipment');

    expect(createButton).not.toBeDisabled();
    await user.click(createButton);
    expect(window.confirm).toBeCalled();
    expect(ShipmentService.create).not.toBeCalled();
  });

  test('allows bypassing with incorrect value', async () => {
    window.confirm.mockReturnValue(true);
    const user = await searchForParts();
    const requestedQuantity = String(testParts.length);
    const quantityInput = screen.getByLabelText('Quantity');
    await user.type(quantityInput, requestedQuantity);
    const createButton = screen.getByText('Create Shipment');

    expect(createButton).not.toBeDisabled();
    await user.click(createButton);
    expect(window.confirm).toBeCalled();
    expect(ShipmentService.create).toBeCalled();
  });
});
