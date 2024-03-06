import React from 'react';
import DataTable from '../../pages/purchasing/DataTable';
import PlusButton from '../buttons/PlusButton';

/**
 * Renders a DataTable and a PlusButton (optional)
 */
export default function ListView({ tableData, onClickFunction }) {
  const { fields, data, styleOverrides, extraClasses } = tableData;

  let classNames = ['tsw-page'];
  classNames = classNames.join(' ');

  return (
    <div className={classNames}>
      <DataTable
        fields={fields}
        data={data}
        styleOverrides={styleOverrides}
        extraClasses={extraClasses}
      />
      <PlusButton onClick={onClickFunction} />
    </div>
  );
}
