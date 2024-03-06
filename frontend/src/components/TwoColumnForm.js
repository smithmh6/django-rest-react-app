import React from 'react';
import DynamicInput from './DynamicInput';

export default function TwoColumnForm({
  inputData,
  values,
  title,
  handleValueChange,
  handleSubmit,
  isSubmitting,
}) {
  const inputArr = Object.entries(inputData);

  return (
    <div className="tsw-form">
      <div className="form-header">{title}</div>
      <div className="form-body">
        <table>
          <tbody className="form-body">
            {inputArr.map(([field, inputObj]) => (
              <tr key={field}>
                <td className="form-label">
                  <label htmlFor={field}>{inputObj.label}</label>
                </td>
                <td className="form-input">
                  <DynamicInput
                    field={field}
                    data={inputObj}
                    value={values[field]}
                    setValue={(value) => handleValueChange(field, value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-footer">
        <button
          type="submit"
          className="form-button submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Create
        </button>
      </div>
    </div>
  );
}
