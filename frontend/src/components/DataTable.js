import React from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import TableTemplate from './TableTemplate';

/*
  DataTable handles rendering of data fetched from a server.
  API:
    - headers: an object that maps data fields to display
      names, like {order_no: 'Production Order'}

    -data: One of the following:
      - `null` implies data has not been fetched, and will render
        a loader on the tbody
      - An array implies the data has been retrieved. An empty array
        will render a "no data available" message. An array with at
        least one item will then render the data.
      - An instance of `Error` implies there was an error in data
        fetching, and will render an Alert box with the error.
      - Note that each array item can also be `null` or an `Error`
        and the appropriate information will be rendered

    - single: boolean. Can be simply omitted for false, or included for true.
      Tells the table whether to treat `data` as an array or a single item.
      Recommended for things like batch info table, where only one row needed.

    - bodyOverrides: object mapping of field to a react element, such as
      {order_no: <p>Text Here</p>}. By default DataTable will just render
      whatever is in the `field` property of each item in the data array.
      This allows overriding that behavior, for example, to render an input
      field for updating certain data.
*/

export default function DataTable({
  headers,
  data,
  single,
  bodyOverrides,
  horizontal,
  onRowClick,
  selectedSet,
  emptyMessage,
}) {
  const headerArr = Object.entries(headers);

  const alertStyling = { marginBottom: 0 };
  const defaultEmptyMessage = 'No Data to Display';

  const spanningCell = (child) => (
    <td
      style={{ width: '16rem' }}
      colSpan={!horizontal ? '100%' : undefined}
      rowSpan={horizontal ? '0' : undefined}
    >
      {child}
    </td>
  );

  const loadingCell = () =>
    spanningCell(<Spinner animation="border" variant="danger" />);

  const errorCell = (error) =>
    spanningCell(
      <Alert variant="danger" dismissible style={alertStyling}>
        <Alert.Heading>{error.message}</Alert.Heading>
      </Alert>
    );

  const createHeaderCell = (field, displayValue) => (
    <th key={`header-${field}`}>{displayValue}</th>
  );

  const createHeaderRows = () => (
    <tr>
      {headerArr.map(([field, displayValue]) =>
        createHeaderCell(field, displayValue)
      )}
    </tr>
  );

  const createCellFromField = (field, dataItem) => {
    const key = `${dataItem.id}-${field}`;
    const fieldData = dataItem[field];
    if (bodyOverrides && bodyOverrides[field]) {
      return bodyOverrides[field](dataItem);
    }
    if (fieldData === undefined) return <td key={key}>Error</td>;
    return <td key={key}>{fieldData}</td>;
  };

  const createRowFromItem = (dataItem) => {
    if (dataItem === null) {
      return <tr key="loading">{loadingCell()}</tr>;
    }
    if (dataItem instanceof Error) {
      return <tr key="error">{errorCell(dataItem)}</tr>;
    }
    // If neither null nor error, populate like normal.

    // Determine classes to assign to row
    const rowClasses = [];
    if (dataItem.fail && dataItem.fail !== 'None') rowClasses.push('fail');
    if (dataItem.fail1_object_id && dataItem.fail1_object_id !== null)
      rowClasses.push('fail');
    if (onRowClick) rowClasses.push('clickable-row');
    if (selectedSet && selectedSet.has(dataItem.id))
      rowClasses.push('selected-row');
    return (
      <tr
        key={dataItem.id}
        className={rowClasses.join(' ')}
        onClick={
          onRowClick ? (event) => onRowClick(dataItem, event) : undefined
        }
      >
        {headerArr.map(([field]) => createCellFromField(field, dataItem))}
      </tr>
    );
  };

  const createBodyRows = () => {
    if (single) return createRowFromItem(data);
    // Case: loading
    if (data === null) {
      return <tr key="loading">{loadingCell()}</tr>;
    }
    // Case: error
    if (data instanceof Error) {
      return <tr key="error">{errorCell(data)}</tr>;
    }
    // Case: no data / empty array
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan="100%">
            <Alert variant="info" style={alertStyling}>
              {emptyMessage || defaultEmptyMessage}
            </Alert>
          </td>
        </tr>
      );
    }
    // Case: data
    return data.map((d) => createRowFromItem(d));
  };

  const createHorizontalRows = () => {
    // Helper function for representing loading and errors
    const withSpanningColumn = (column) => {
      const [first, ...rest] = headerArr;
      const [firstField, firstDisplayValue] = first;
      return (
        <>
          <tr key={firstField}>
            {createHeaderCell(firstField, firstDisplayValue)}
            {column}
          </tr>
          {rest.map(([field, displayValue]) => (
            <tr key={field}>{createHeaderCell(field, displayValue)}</tr>
          ))}
        </>
      );
    };

    if (data === null) return withSpanningColumn(loadingCell());
    if (data instanceof Error) return withSpanningColumn(errorCell(data));

    // Otherwise, return each block properly rendered
    return headerArr.map(([field, displayValue]) => (
      <tr key={field}>
        {createHeaderCell(field, displayValue)}
        {createCellFromField(field, data)}
      </tr>
    ));
  };

  if (data === undefined) {
    const emptyRow = () => {
      return (
        <tr>
          <td />
        </tr>
      );
    };

    return <TableTemplate extraClasses={['empty']} bodyRows={emptyRow()} />;
  }

  if (horizontal) {
    if (single) {
      return (
        <TableTemplate
          extraClasses={['horizontal']}
          bodyRows={createHorizontalRows()}
        />
      );
    }
    console.error('Horizontal multi-data tables not implemented.');
  }

  return (
    <TableTemplate
      headerRows={createHeaderRows()}
      bodyRows={createBodyRows()}
    />
  );
}
