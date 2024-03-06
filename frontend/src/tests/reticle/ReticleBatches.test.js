import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Batches from '../../pages/Batches';
import RequestService from '../../services/requests/RequestService';
import ExampleData from '../../data/ExampleData';

// Mock API
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/requests/RequestService');

const { exampleCoatBatch } = ExampleData.rtt;

describe('Batches.js', () => {
  test('renders correct text with no batches', async () => {
    // Mock Request service;
    RequestService.mockReturnValue({
      getAllBatches: () => [],
      httpGet: () => ({}),
    });
    RequestService.makeRequest.mockReturnValue([]);

    render(
      <MemoryRouter initialEntries={['/coat']}>
        <Routes>
          <Route path=":batchType" element={<Batches />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('There are no open batches at this time!');
  });

  test('renders correct default batch number', async () => {
    // Mock Request service
    RequestService.mockReturnValue({
      getAllBatches: () => [],
      httpGet: () => ({}),
    });
    RequestService.makeRequest.mockReturnValue([]);

    render(
      <MemoryRouter initialEntries={['/coat']}>
        <Routes>
          <Route path=":batchType" element={<Batches />} />
        </Routes>
      </MemoryRouter>
    );

    const batchInput = await screen.findByPlaceholderText('Batch');
    expect(batchInput).toHaveValue('CB000001');
  });

  test('render correct highest batch number with response', async () => {
    // Mock Request service
    RequestService.mockReturnValue({
      getAllBatches: () => [],
      httpGet: () => ({}),
    });
    RequestService.makeRequest.mockReturnValue([{ name: 'CB001234' }]);

    render(
      <MemoryRouter initialEntries={['/coat']}>
        <Routes>
          <Route path=":batchType" element={<Batches />} />
        </Routes>
      </MemoryRouter>
    );

    const batchInput = await screen.findByPlaceholderText('Batch');
    expect(batchInput).toHaveValue('CB001235');
  });

  test('renders single batch correctly', async () => {
    // Mock Request service
    RequestService.mockReturnValue({
      getAllBatches: () => [exampleCoatBatch],
      httpGet: () => ({}),
    });
    RequestService.makeRequest.mockReturnValue([]);

    render(
      <MemoryRouter initialEntries={['/coat']}>
        <Routes>
          <Route path=":batchType" element={<Batches />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(exampleCoatBatch.name);
    await screen.findByText(exampleCoatBatch.coat_sku_detail.name);
    await screen.findByText(exampleCoatBatch.order_no);
    await screen.findByText(exampleCoatBatch.step_object_id);
    await screen.findByText(exampleCoatBatch.qty);
    await screen.findByText(exampleCoatBatch.pass_qty);
    if (exampleCoatBatch.notes) await screen.findByText(exampleCoatBatch.notes);
  });

  test('calls API on form submission', async () => {
    const user = userEvent.setup();
    const mockPost = jest.fn().mockReturnValue(exampleCoatBatch);

    // Mock Request service
    RequestService.mockReturnValue({
      getAllBatches: () => [],
      httpGet: () => ({}),
      httpPost: mockPost,
    });
    RequestService.makeRequest.mockReturnValue([]);
    RequestService.makeRequest.mockImplementation((method, url) => {
      if (url.includes('skus')) {
        return [exampleCoatBatch.coat_sku_detail];
      }
      return [];
    });

    render(
      <MemoryRouter initialEntries={['/coat']}>
        <Routes>
          <Route path=":batchType" element={<Batches />} />
        </Routes>
      </MemoryRouter>
    );

    // Helper function used to enter batch data
    const typeInto = async (placeholder, text) => {
      await user.click(await screen.findByPlaceholderText(placeholder));
      await user.keyboard(`${text}`);
    };

    // Type into form inputs, then click submit "+" button
    await typeInto('SKU', exampleCoatBatch.coat_sku_detail.name);
    await typeInto('Order No.', exampleCoatBatch.order_no);
    await typeInto('QTY', exampleCoatBatch.qty);
    await user.click(await screen.findByDisplayValue('+'));

    expect(window.alert).not.toBeCalled();

    const expectedSubmissionData = {
      name: 'CB000001',
      sku_object_id: exampleCoatBatch.coat_sku_detail.id,
      order_no: exampleCoatBatch.order_no,
      qty: String(exampleCoatBatch.qty),
    };
    expect(mockPost).toBeCalledWith('coat', expectedSubmissionData);
  });

  test("doesn't call API if SKU is invalid", async () => {
    const user = userEvent.setup();
    const mockPost = jest.fn().mockReturnValue(exampleCoatBatch);

    // Mock Request service
    RequestService.mockReturnValue({
      getAllBatches: () => [],
      httpGet: () => ({}),
      httpPost: mockPost,
    });
    RequestService.makeRequest.mockReturnValue([]);
    RequestService.makeRequest.mockReturnValue([]);

    render(
      <MemoryRouter initialEntries={['/coat']}>
        <Routes>
          <Route path=":batchType" element={<Batches />} />
        </Routes>
      </MemoryRouter>
    );

    // Helper function used to enter batch data
    const typeInto = async (placeholder, text) => {
      await user.click(await screen.findByPlaceholderText(placeholder));
      await user.keyboard(`${text}`);
    };

    // Type into form inputs, then click submit "+" button
    await typeInto('SKU', exampleCoatBatch.coat_sku_detail.coat_sku);
    await typeInto('Order No.', exampleCoatBatch.order_no);
    await typeInto('QTY', exampleCoatBatch.qty);
    await user.click(await screen.findByDisplayValue('+'));
    expect(mockPost).not.toBeCalled();
  });
});
