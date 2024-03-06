import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import PurchaseRequests from '../../../pages/purchasing/requests/PurchaseRequests';
import RequestService from '../../../services/requests/RequestService';
import ExampleData from '../../../data/ExampleData';

// Mock modules
jest.mock('../../../authConfig', () => jest.fn());
jest.mock('../../../services/requests/RequestService');

const newRequestID = '101';

describe('PurchaseRequests.js', () => {
  const renderPage = () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<PurchaseRequests />} />
        </Routes>
      </MemoryRouter>
    );
  };

  const renderWithMocks = () => {
    const { requests, requestStatuses } = ExampleData.purchasing;

    RequestService.makeRequest.mockImplementation((method, url, body) => {
      if (method === 'GET') {
        if (url.includes('user-requests')) return requests;
        if (url.includes('request-status')) return requestStatuses;
        return [];
      }
      if (method === 'POST') {
        return [...requests, { id: newRequestID, ...body }];
      }
      if (method === 'PATCH') {
        return body;
      }
      return null;
    });

    renderPage();
  };

  test('renders request IDs', async () => {
    renderWithMocks();
    await screen.findByText('Request ID');
    ExampleData.purchasing.requests.map((request) =>
      screen.getByText(request.id)
    );
  });

  test('displays form title on form button click', async () => {
    renderWithMocks();
    await screen.findByText('Request ID');
    const newRequestButton = screen.getByRole('button', {
      name: 'New Request',
    });
    const user = userEvent.setup();
    await user.click(newRequestButton);
    screen.getByText('New Purchase Request');
  });

  test('calls endpoint with POST on creation', async () => {
    renderWithMocks();
    await screen.findByText('Request ID');
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: 'New Request',
      })
    );

    const notesInputs = screen.getAllByPlaceholderText('Notes');
    const formNotesInput = notesInputs.find((element) =>
      element.className.includes('purchase-form-text-area')
    );

    await user.type(formNotesInput, 'my notes text');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    // Test that make request is called with POST:
    // Find the most recent call with slice(-1)[0]
    // Then compare the first argument, found at [0]
    expect(RequestService.makeRequest.mock.calls.slice(-1)[0][0]).toBe('POST');
  });

  test('renders returned request ID', async () => {
    renderWithMocks();
    await screen.findByText('Request ID');
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: 'New Request',
      })
    );

    const notesInputs = screen.getAllByPlaceholderText('Notes');
    const formNotesInput = notesInputs.find((element) =>
      element.className.includes('purchase-form-text-area')
    );

    await user.type(formNotesInput, 'my notes text');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await screen.findByText(newRequestID);
  });

  test('calls endpoint with PATCH on save', async () => {
    renderWithMocks();
    await screen.findByText('Request ID');
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: 'Save',
      })
    );

    expect(RequestService.makeRequest.mock.calls.slice(-1)[0][0]).toBe('PATCH');
  });
});
