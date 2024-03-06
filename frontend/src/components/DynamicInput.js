import React from 'react';

export default function DynamicInput({ field, data, value, setValue }) {
  const inputType = data.inputType ?? 'text'; // use text as default inputType
  const onChange = (event) => setValue(event.target.value);

  const createInput = (type) => (
    <input
      key={field}
      id={field}
      value={value}
      onChange={onChange}
      type={type}
      size={data.size}
    />
  );

  const createCheckbox = () => {
    const checkboxHandler = (event) => setValue(event.target.checked);
    return (
      <input
        key={field}
        id={field}
        checked={value}
        onChange={checkboxHandler}
        type="checkbox"
      />
    );
  };

  const createDatalistInput = (options) => {
    const createOption = (option) => {
      if (typeof option === 'string') {
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      }
      return (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      );
    };

    return (
      <>
        <input list="items" value={value} onChange={onChange} />
        <datalist id="items">{options.map(createOption)}</datalist>
      </>
    );
  };

  const createSelectInput = (options, groups, groupField) => {
    const createOption = (option) => {
      if (typeof option === 'string') {
        return (
          <option key={option} value={option}>
            {option}
          </option>
        );
      }
      return (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      );
    };

    if (groups) {
      return (
        <select key={field} id={field} value={value} onChange={onChange}>
          {options.filter(({ group }) => !group).map(createOption)}
          {groups.map((group) => {
            const optionsInGroup = options.filter(
              (option) =>
                (groupField ? option[groupField] : option.group) === group
            );
            return (
              <optgroup key={group} label={group}>
                {optionsInGroup.map(createOption)}
              </optgroup>
            );
          })}
        </select>
      );
    }

    return (
      <select key={field} id={field} value={value} onChange={onChange}>
        {options.map(createOption)}
      </select>
    );
  };

  const createButtonGroup = (options) => (
    <div className="btn-group" data-toggle="buttons">
      {options.map((option) => {
        return (
          <label
            key={option}
            className={`btn tsw-btn ${value === option && 'selected'}`}
          >
            <input
              type="radio"
              name={field}
              id={option}
              value={option}
              onChange={onChange}
              checked={value === option}
              hidden
            />
            {option}
          </label>
        );
      })}
    </div>
  );

  const createTextArea = () => (
    <textarea id={field} name={field} value={value} onChange={onChange} />
  );

  switch (inputType) {
    case 'datalist':
      return createDatalistInput(data.options, data.groups, data.groupField);
    case 'select':
      return createSelectInput(data.options, data.groups, data.groupField);
    case 'radio':
      return createButtonGroup(data.options);
    case 'textarea':
      return createTextArea();
    case 'checkbox':
      return createCheckbox();
    default:
      return createInput(inputType);
  }
}
