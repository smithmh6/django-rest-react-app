import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
// import App from '../App';
import RequestService from '../../services/requests/RequestService';
import Plates from '../../pages/Plates';
import ExampleData from '../../data/ExampleData';

// Mock API
jest.mock('../../authConfig', () => jest.fn());
jest.mock('../../services/requests/RequestService');

const { exampleDiceBatch, exampleDicePlates, failcodes, steps } =
  ExampleData.rtt;

describe('Plates.js', () => {
  test('renders dice batch info correctly', async () => {
    RequestService.makeRequest
      .mockReturnValueOnce(exampleDiceBatch)
      .mockReturnValueOnce(exampleDicePlates)
      .mockReturnValueOnce(failcodes)
      .mockReturnValue(steps);

    render(
      <MemoryRouter initialEntries={['/dice/1/plates']}>
        <Routes>
          <Route path=":batchType/:batchId/:batchView" element={<Plates />} />
        </Routes>
      </MemoryRouter>
    );

    const batchStepCode = steps.find(
      ({ id }) => id === exampleDiceBatch.step_object_id
    ).name;

    // Renders batch info
    await screen.findByText(exampleDiceBatch.name);
    await screen.findByText(exampleDiceBatch.dice_sku_detail.name);
    await screen.findByText(exampleDiceBatch.order_no);
    await screen.findByText(batchStepCode);
    // TODO: check that parts and plate qty render correctly
    await screen.findByText(exampleDiceBatch.value);
  });

  test('renders dice part info correctly', async () => {
    RequestService.makeRequest
      .mockReturnValueOnce(exampleDiceBatch)
      .mockReturnValueOnce(exampleDicePlates)
      .mockReturnValueOnce(failcodes)
      .mockReturnValue(steps);

    render(
      <MemoryRouter initialEntries={['/dice/1/plates']}>
        <Routes>
          <Route path=":batchType/:batchId/:batchView" element={<Plates />} />
        </Routes>
      </MemoryRouter>
    );

    exampleDicePlates.map(async (p) => {
      await screen.findByText(p.part_serial);
    });
  });

  test('calls API on dice part measurement change correctly', async () => {
    const user = userEvent.setup();
    const numberToType = 5;

    // Mock resonses to GET requests
    RequestService.makeRequest
      .mockReturnValueOnce(exampleDiceBatch)
      .mockReturnValueOnce(exampleDicePlates)
      .mockReturnValueOnce(failcodes)
      .mockReturnValue(steps);

    render(
      <MemoryRouter initialEntries={['/batches/dice/1/plates']}>
        <Routes>
          <Route
            path="/batches/:batchType/:batchId/:batchView"
            element={<Plates />}
          />
        </Routes>
      </MemoryRouter>
    );

    // 'spinbutton' is the aria-role of inputs with type number
    const numberInputs = await screen.findAllByRole('spinbutton');
    numberInputs.forEach(async (i) => {
      await user.click(i);
      await user.keyboard(`${numberToType}`);
    });

    // Mock out PATCH request responses
    RequestService.makeRequest
      .mockReturnValueOnce(
        exampleDicePlates.map((p) => ({
          ...p,
          length: numberToType,
          width: numberToType,
          thickness: numberToType,
        }))
      )
      .mockReturnValueOnce(exampleDiceBatch);

    const saveButton = await screen.findByText('Save');
    await user.click(saveButton);

    const updatedNumberInputs = await screen.findAllByRole('spinbutton');

    updatedNumberInputs.forEach(async (i) => {
      expect(i).toHaveValue(numberToType);
    });
  });
});
