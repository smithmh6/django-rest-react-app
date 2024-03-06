import React from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import DataTable from '../DataTable';

/**
 * Renders a DataTable and a PlusButton (optional)
 */
export default function PurchaseRequestListView({
  tableData,
  onNewPurchaseRequestClick,
  onSaveRequestsFunction,
  isFetching,
  inputChangeFunction,
  rowClickFunction,
}) {
  const { fields, data, styleOverrides, classNames } = tableData;

  let containerClasses = ['tsw-page'];
  containerClasses = containerClasses.join(' ');

  const getDisplay = (isFetchingData) => {
    return isFetchingData ? (
      <div className="tsw-page">
        <Spinner animation="border" variant="danger" />
      </div>
    ) : (
      <>
        <div>
          <Button
            style={{ margin: '5px 5px 5px 5px' }}
            variant="tsw-primary"
            onClick={onNewPurchaseRequestClick}
          >
            New Request
          </Button>
          <Button
            style={{ margin: '5px 5px 5px 5px' }}
            variant="tsw-primary"
            onClick={(event) => onSaveRequestsFunction(event)}
          >
            Save
          </Button>
        </div>
        <DataTable
          fields={fields}
          data={data}
          inputChangeFunction={inputChangeFunction}
          styleOverrides={styleOverrides}
          classNames={classNames}
          rowClickFunction={rowClickFunction}
        />
      </>
    );
  };

  return <div className={containerClasses}>{getDisplay(isFetching)}</div>;
}
