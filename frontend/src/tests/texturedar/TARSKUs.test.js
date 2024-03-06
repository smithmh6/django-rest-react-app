import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import {
  TARProductCategoryService,
  TARSkuService,
} from '../../services/Services';
import ExampleData from '../../data/ExampleData';
import TARSKUs from '../../pages/TARSKU/TARSKUs';

// Mock services
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/Services');

describe('TARSKUs', () => {
  const testVendorSKUs = ExampleData.tar.vendorSkus;
  const testRMSKUs = ExampleData.tar.rmSkus;
  const testOCSKUs = ExampleData.tar.ocSkus.slice(1);
  const testFPSKUs = ExampleData.tar.fpSkus;
  const testCategories = ExampleData.tar.categories;

  const renderPage = () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<TARSKUs />} />
        </Routes>
      </MemoryRouter>
    );
  };

  function mockServicesUnresolved() {
    const unresolvedPromise = new Promise(() => {});
    TARSkuService.getVendor.mockReturnValue(unresolvedPromise);
    TARSkuService.getRawMaterial.mockReturnValue(unresolvedPromise);
    TARSkuService.getOpticalCoat.mockReturnValue(unresolvedPromise);
    TARSkuService.getFinalProduct.mockReturnValue(unresolvedPromise);
    TARProductCategoryService.get.mockReturnValue(unresolvedPromise);
  }

  function mockServices() {
    TARSkuService.getVendor.mockReturnValue(testVendorSKUs);
    TARSkuService.getRawMaterial.mockReturnValue(testRMSKUs);
    TARSkuService.getOpticalCoat.mockReturnValue(testOCSKUs);
    TARSkuService.getFinalProduct.mockReturnValue(testFPSKUs);
    TARProductCategoryService.get.mockReturnValue(testCategories);
  }

  const renderWithMocks = () => {
    mockServices();
    renderPage();
  };

  test('mounts successfully', () => {
    mockServicesUnresolved();
    renderPage();
  });

  test('calls expected endpoints', () => {
    mockServicesUnresolved();
    renderPage();
    expect(TARSkuService.getRawMaterial).toBeCalled();
    expect(TARSkuService.getOpticalCoat).toBeCalled();
    expect(TARSkuService.getFinalProduct).toBeCalled();
  });

  test('renders OC SKUs by default', async () => {
    renderWithMocks();

    const OCTable = screen.getByTestId('opticalcoat-table');

    await Promise.all(
      testOCSKUs.map(async (ocSku) => {
        const ocSkuTd = await within(OCTable).findByText(ocSku.name);
        expect(ocSkuTd).toBeVisible();
      })
    );
  });

  test('renders detail information on click', async () => {
    renderWithMocks();

    const firstOCSKU = testOCSKUs[0];

    const user = userEvent.setup();

    const OCTable = screen.getByTestId('opticalcoat-table');
    const ocSkuTd = await within(OCTable).findByText(firstOCSKU.name);

    await user.click(ocSkuTd);

    const detail = screen.getByTestId('opticalcoat-detail');
    within(detail).getByText(firstOCSKU.name);
    within(detail).getByText(firstOCSKU.description);
    within(detail).getByText(firstOCSKU.rm_sku);
  });

  test('navigates to child detail on child link click', async () => {
    renderWithMocks();

    const firstOCSKU = testOCSKUs[0];

    // Open detail
    const user = userEvent.setup();
    const OCTable = screen.getByTestId('opticalcoat-table');
    const ocSkuTd = await within(OCTable).findByText(firstOCSKU.name);
    await user.click(ocSkuTd);

    const detail = screen.getByTestId('opticalcoat-detail');
    const childLink = within(detail).getByText(firstOCSKU.rm_sku);

    await user.click(childLink);

    const childDetail = screen.getByTestId('rawmaterial-detail');
    const childSku = testRMSKUs.find(({ name }) => name === firstOCSKU.rm_sku);
    const childNames = within(childDetail).getAllByText(childSku.name);
    // RM SKUs match the names of their vendor SKUs
    // So we expect 2 copies of its name for each
    expect(childNames).toHaveLength(2);
    within(childDetail).getByText(childSku.description);
  });

  test('opens creation form on plus button click', async () => {
    renderWithMocks();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('tar-opticalcoat-create-open'));
    screen.getByText('Create New OC SKU');
  });

  test('calls endpoint with appropriate data on form submit', async () => {
    renderWithMocks();
    const user = userEvent.setup();

    const newSKUName = 'NEW-OC-SKU';

    await user.click(screen.getByTestId('tar-opticalcoat-create-open'));
    await user.type(screen.getByLabelText('Name'), newSKUName);
    await user.type(screen.getByLabelText('Description'), 'A new SKU');
    await user.type(screen.getByLabelText('Location'), 'somewhere');
    await user.click(screen.getByLabelText('Active'));

    await user.selectOptions(
      screen.getByLabelText('RM SKU'),
      testRMSKUs[0].name
    );

    TARSkuService.createOpticalCoat.mockReturnValue({
      id: 999, // dummy ID to avoid a bad key error
      name: newSKUName,
    });
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(TARSkuService.createOpticalCoat).toBeCalled();
    await screen.findByText(newSKUName);
  });
});
