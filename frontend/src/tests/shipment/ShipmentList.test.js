import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ShipmentService } from '../../services/Services';
import exampleData from '../../data/ExampleData';
import ShipmentList from '../../pages/Shipment/List';
// Mock services
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/Services');

window.alert = jest.fn();
window.confirm = jest.fn();

describe('ShipmentList page', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ShipmentList />} />
        </Routes>
      </MemoryRouter>
    );
  }

  test('loads open shipment IDs', async () => {
    const { shipments } = exampleData.purchasing;
    ShipmentService.getOpen.mockReturnValue(shipments);
    setup();
    await Promise.all(shipments.map(async (s) => screen.findByText(s.id)));
    expect(ShipmentService.get).not.toBeCalled();
  });

  test('renders correct inputs for blank transfer/tracking numbers', async () => {
    const { shipments } = exampleData.purchasing;
    ShipmentService.getOpen.mockReturnValue(shipments);
    setup();
    await screen.findByText('1');
    // Doing this lazy instead of programmatically
    // Will be accurate unless exampleData changes.
    screen.getByText('TR00123');
    screen.getByText('TR00124');
    screen.getByText('123456');
    screen.getByText('654321');

    const transferInputs = screen.getAllByPlaceholderText('Transfer Order');
    const trackingInputs = screen.getAllByPlaceholderText('Tracking No.');
    expect(transferInputs.length).toBe(2);
    expect(trackingInputs.length).toBe(2);
  });

  test('calls service with data on save button press', async () => {
    const { shipments } = exampleData.purchasing;
    ShipmentService.getOpen.mockReturnValue(shipments);
    setup();
    await screen.findByText('1');
    const saveButton = screen.getByText('Save');
    const user = userEvent.setup();
    await user.click(saveButton);
    expect(ShipmentService.updateOpen).toBeCalled();
  });

  test('renders returned data after save', async () => {
    const { shipments } = exampleData.purchasing;
    ShipmentService.getOpen.mockReturnValue([]);
    ShipmentService.updateOpen.mockReturnValue(shipments);
    setup();
    const saveButton = screen.getByText('Save');
    const user = userEvent.setup();
    await user.click(saveButton);
    expect(ShipmentService.updateOpen).toBeCalled();

    screen.getByText('TR00123');
    screen.getByText('TR00124');
    screen.getByText('123456');
    screen.getByText('654321');

    const transferInputs = screen.getAllByPlaceholderText('Transfer Order');
    const trackingInputs = screen.getAllByPlaceholderText('Tracking No.');
    expect(transferInputs.length).toBe(2);
    expect(trackingInputs.length).toBe(2);
  });

  // TODO: Figure out how to test for individual inputs
});
