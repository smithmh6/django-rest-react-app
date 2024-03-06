import React from 'react';
import { Button } from 'react-bootstrap';
import DynamicInput from './DynamicInput';
import TableTemplate from './TableTemplate';

export default function TwoRowForm({
  inputData,
  values,
  handleValueChange,
  handleSubmit,
  disableSubmit,
}) {
  const inputArr = Object.entries(inputData);

  const tableHeader = (
    <tr>
      {inputArr.map(([field, inputObj]) => (
        <td key={field}>
          <label htmlFor={field}>{inputObj.label}</label>
        </td>
      ))}
    </tr>
  );

  const tableBody = (
    <tr>
      {inputArr.map(([field, inputObj]) => {
        return (
          <td key={field}>
            <DynamicInput
              field={field}
              data={inputObj}
              value={values[field]}
              setValue={(value) => handleValueChange(field, value)}
            />
          </td>
        );
      })}
    </tr>
  );

  return (
    <>
      <TableTemplate headerRows={tableHeader} bodyRows={tableBody} />
      <Button
        type="submit"
        variant="tsw-primary"
        onClick={handleSubmit}
        disabled={disableSubmit}
      >
        Search
      </Button>
    </>
  );
}
