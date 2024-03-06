/* eslint-disable no-underscore-dangle */
import React from 'react';

// add a URL control to the control builder !!!
function buildUrlControl(obj, key) {
  if (!obj) return 'No URL Found';
  if (obj[key])
    return (
      <a href={obj[key]} target="_blank" rel="noopener noreferrer">
        LINK
      </a>
    );
  return 'No URL Found';
}

function buildTextInput(obj, key, attrs, inputChangeHandler) {
  const options = Object.hasOwn(attrs, 'options') ? attrs.options : null;
  const choices = Object.hasOwn(options, 'choices') ? options.choices : null;
  const fkField = Object.hasOwn(attrs, 'fkField') ? attrs.fkField : 'code';
  const displayField = Object.hasOwn(attrs, 'displayField')
    ? attrs.displayField
    : 'name';

  const getDefaultValue = () => {
    if (choices) {
      const _defaultValue = choices.find((item) => item[fkField] === obj[key]);
      if (_defaultValue)
        if (Object.hasOwn(_defaultValue, fkField)) {
          return _defaultValue[displayField];
        }
    }
    return obj[key];
  };

  if (!obj)
    return (
      <input
        id={`${key}-textinput`}
        type="text"
        value=""
        name={`${key}`}
        className="text-input"
        placeholder={
          Object.hasOwn(options, 'placeholder')
            ? options.placeholder
            : undefined
        }
        onChange={(event) => inputChangeHandler(key, event)}
      />
    );

  if (Object.hasOwn(attrs, 'editable')) {
    if (!attrs.editable) return getDefaultValue();
  }

  return (
    <input
      id={`${obj.id}-${key}-textinput`}
      type="text"
      name={`${key}`}
      value={getDefaultValue() || ''}
      className="text-input"
      placeholder={
        Object.hasOwn(options, 'placeholder') ? options.placeholder : undefined
      }
      onChange={(event) => inputChangeHandler(obj, event)}
    />
  );
}

function buildTextArea(obj, key, attrs, inputChangeHandler) {
  const options = Object.hasOwn(attrs, 'options') ? attrs.options : null;

  if (!obj)
    return (
      <textarea
        id={`${key}-textarea`}
        name={`${key}`}
        className="text-area purchase-form-text-area"
        placeholder={
          Object.hasOwn(options, 'placeholder')
            ? options.placeholder
            : undefined
        }
        onChange={(event) => inputChangeHandler(key, event)}
      />
    );

  if (Object.hasOwn(attrs, 'editable')) {
    if (!attrs.editable) return obj[key];
  }

  return (
    <textarea
      id={`${obj.id}-${key}-textarea`}
      name={`${key}`}
      value={obj[key] || ''}
      className="text-area purchase-form-text-area"
      placeholder={
        Object.hasOwn(options, 'placeholder') ? options.placeholder : undefined
      }
      onChange={(event) => inputChangeHandler(obj, event)}
    />
  );
}

function buildNumberInput(obj, key, attrs, inputChangeHandler) {
  const options = Object.hasOwn(attrs, 'options') ? attrs.options : null;

  if (!obj)
    return (
      <input
        id={`${key}-numberinput`}
        name={`${key}`}
        type="number"
        className="num-input"
        placeholder={
          Object.hasOwn(options, 'placeholder')
            ? options.placeholder
            : undefined
        }
        onChange={(event) => inputChangeHandler(key, event)}
      />
    );

  if (Object.hasOwn(attrs, 'editable')) {
    if (!attrs.editable) return obj[key];
  }

  return (
    <input
      id={`${obj.id}-${key}-numberinput`}
      name={`${key}`}
      type="number"
      defaultValue={obj[key]}
      className="num-input"
      placeholder={
        Object.hasOwn(options, 'placeholder') ? options.placeholder : undefined
      }
      onChange={(event) => inputChangeHandler(obj, event)}
    />
  );
}

function buildSelectInput(obj, key, attrs, inputChangeHandler) {
  const options = Object.hasOwn(attrs, 'options') ? attrs.options : null;
  const choices = Object.hasOwn(options, 'choices') ? options.choices : null;

  if (!obj)
    return (
      <select
        id={`${key}-selectinput`}
        name={`${key}`}
        onChange={(event) => inputChangeHandler(key, event)}
      >
        <option key="no-option" value="">
          ----------
        </option>
        {choices.map((choice) => (
          // NOTE: change to bracket [valueField] for keyed field
          // can change keyed field as needed (id, code, name, etc...)
          // can get from attrs.valueField, or .fkField, or have a default option
          <option key={`${choice.id}-option`} value={choice.code}>
            {choice.name}
          </option>
        ))}
      </select>
    );

  const getDefaultValue = () => {
    const _defaultValue = choices.find((item) => item.code === obj[key]);
    if (_defaultValue)
      if (Object.hasOwn(_defaultValue, 'code')) {
        return _defaultValue.code;
      }
    return '';
  };

  if (Object.hasOwn(attrs, 'editable')) {
    if (!attrs.editable) {
      const _displayValue = choices.find((item) => item.code === obj[key]);
      if (_displayValue)
        if (Object.hasOwn(_displayValue, 'name')) {
          return _displayValue.name;
        }
      return '';
    }
  }

  return (
    <select
      id={`${obj.id}-${key}-selectinput`}
      name={`${key}`}
      onChange={(event) => inputChangeHandler(obj, event)}
      defaultValue={getDefaultValue()}
    >
      <option key="no-option" value="">
        ----------
      </option>
      {choices.map((choice) => (
        <option key={`${choice.id}-option`} value={choice.code}>
          {choice.name}
        </option>
      ))}
    </select>
  );
}

function buildDateControl(obj, key, attrs, inputChangeHandler) {
  if (!obj)
    return <input id={`${key}-dateinput`} name={`${key}`} type="date" />;

  if (Object.hasOwn(attrs, 'editable')) {
    if (!attrs.editable) {
      return obj[key];
    }
  }

  return (
    <input
      id={`${obj.id}-${key}-dateinput`}
      name={`${key}`}
      type="date"
      value={obj[key] || ''}
      onChange={(event) => inputChangeHandler(obj, event)}
    />
  );
}

export default function controlBuilder(obj, key, attrs, inputChangeHandler) {
  if (attrs.control === 'textarea') {
    return buildTextArea(obj, key, attrs, inputChangeHandler);
  }
  if (attrs.control === 'textinput') {
    return buildTextInput(obj, key, attrs, inputChangeHandler);
  }
  if (attrs.control === 'numberinput') {
    return buildNumberInput(obj, key, attrs, inputChangeHandler);
  }
  if (attrs.control === 'selectinput') {
    return buildSelectInput(obj, key, attrs, inputChangeHandler);
  }
  if (attrs.control === 'url') {
    return buildUrlControl(obj, key);
  }
  if (attrs.control === 'dateinput') {
    return buildDateControl(obj, key, attrs, inputChangeHandler);
  }
  return <div>No control rendered</div>;
}
