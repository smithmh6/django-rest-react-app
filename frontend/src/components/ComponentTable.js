/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';
import TableTemplate from './TableTemplate';

const defaultOptions = {
  tdAttributes: {},
  body: ({ value }) => value,
  header: ({ value }) => value,
};

// Populates any missing fields with defaults
// so that ComponentTable can consume them properly
export function addDefaults(fieldOptions) {
  const withDefaults = (options) => ({
    ...defaultOptions,
    ...options,
  });

  const fieldOptionsArray = Object.entries(fieldOptions);
  const fieldOptionsArrayWithDefaults = fieldOptionsArray.map(
    ([field, options]) => [field, withDefaults(options)]
  );

  return new Map(fieldOptionsArrayWithDefaults);
}

// Converts the simplest field entry, {field: 'string'}
// to be ComponentTable-compatible: {field: {header: 'string'}}
export function fieldTransformer(fieldOptions) {
  const fieldOptionsArray = Object.entries(fieldOptions);
  const transformed = fieldOptionsArray.map(([field, options]) => {
    if (typeof options === 'string') {
      return [field, { header: options }];
    }
    return [field, options];
  });

  return Object.fromEntries(transformed);
}

const headerCell = (field, header) => {
  let innerContent = header;
  if (typeof header === 'function') {
    const HeaderComponent = header;
    innerContent = <HeaderComponent value={field} />;
  }
  return <th key={field}>{innerContent}</th>;
};

const headerRow = (fieldOptions) => {
  return (
    <tr>
      {Array.from(fieldOptions).map(([field, options]) =>
        headerCell(field, options.header)
      )}
    </tr>
  );
};

const bodyCell = (dataItem, field, cellProps, inner) => {
  let innerContent = inner;
  if (typeof inner === 'function') {
    const ChildComponent = inner;
    innerContent = (
      <ChildComponent
        value={dataItem[field]}
        field={field}
        obj={dataItem}
        id={dataItem.id}
      />
    );
  }

  const extraProps =
    typeof cellProps === 'function' ? cellProps(dataItem[field]) : cellProps;

  return (
    <td key={field} {...extraProps}>
      {innerContent}
    </td>
  );
};

const bodyRow = (dataItem, fieldData, rowProps) => {
  // Calculate props if function
  const extraProps =
    typeof rowProps === 'function' ? rowProps(dataItem) : rowProps;

  return (
    <tr key={dataItem.id} {...extraProps}>
      {Array.from(fieldData).map(([field, options]) => {
        return bodyCell(
          dataItem,
          field,
          options.tdAttributesFunction,
          options.body
        );
      })}
    </tr>
  );
};

const bodyRows = (data, rowProps, fieldData) =>
  data.map((dataItem) => bodyRow(dataItem, fieldData, rowProps));

// TODO: Apply trAttributes function vertically along components
const createHorizontalRows = (data, trAttributesFunction, fieldOptions) => {
  return Array.from(fieldOptions).map(([field, options]) => (
    <tr key={field}>
      {headerCell(field, options.header)}
      {data.map((item) =>
        bodyCell(item, field, options.tdAttributes, options.body)
      )}
    </tr>
  ));
};

export default function ComponentTable({
  data,
  fieldOptions,
  rowProps,
  horizontal,
  AlternateTable,
  ...props
}) {
  const fieldOptionsWithDefaults = useMemo(
    () => addDefaults(fieldTransformer(fieldOptions)),
    [fieldOptions]
  );

  if (horizontal) {
    return (
      <TableTemplate
        {...props}
        extraClasses={['horizontal']}
        bodyRows={createHorizontalRows(
          data,
          rowProps,
          fieldOptionsWithDefaults
        )}
      />
    );
  }

  if (AlternateTable) {
    return (
      <AlternateTable
        {...props}
        bodyRows={bodyRows(data, rowProps, fieldOptionsWithDefaults)}
        headerRows={headerRow(fieldOptionsWithDefaults)}
      />
    );
  }

  return (
    <TableTemplate
      {...props}
      bodyRows={bodyRows(data, rowProps, fieldOptionsWithDefaults)}
      headerRows={headerRow(fieldOptionsWithDefaults)}
    />
  );
}
