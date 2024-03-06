import React from 'react';
import inputFactory from './InputFactory';

export default function DataTable({
  fields,
  data,
  inputChangeFunction,
  classNames,
  styleOverrides,
  rowClickFunction,
}) {
  let fieldsArr = Array.from(fields);

  // filter out fields where isVisible = false
  fieldsArr = fieldsArr.filter(([, attrs]) => {
    return Object.hasOwn(attrs, 'isVisible') ? attrs.isVisible : true;
  });

  let containerClasses = ['tsw-table', 'striped', 'rounded', 'bordered'];
  let rowClasses = [];
  let cellClasses = [];

  if (classNames) {
    if (Object.hasOwn(classNames, 'container')) {
      containerClasses = [...containerClasses, ...classNames.container];
    }

    if (Object.hasOwn(classNames, 'rows')) {
      rowClasses = [...rowClasses, ...classNames.rows];
    }

    if (Object.hasOwn(classNames, 'cells')) {
      cellClasses = [...cellClasses, ...classNames.cells];
    }
  }
  containerClasses = containerClasses.join(' ');
  rowClasses = rowClasses.join(' ');
  cellClasses = cellClasses.join(' ');

  // eslint-disable-next-line no-underscore-dangle
  let _styleOverrides = {};
  if (styleOverrides) {
    _styleOverrides = { ..._styleOverrides, ...styleOverrides };
  }

  if (data) {
    return (
      <div className={containerClasses} style={_styleOverrides}>
        <table>
          <thead>
            <tr>
              {fieldsArr.map(([name, attrs]) => (
                <th key={`header-${name}`}>{attrs.display}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((obj) => (
              <tr
                key={`row-${obj.id}`}
                className={rowClasses}
                onClick={
                  rowClickFunction
                    ? (event) => rowClickFunction(obj, event)
                    : undefined
                }
              >
                {fieldsArr.map(([name, attrs]) => (
                  <td key={`col-${obj.id}-${name}`} className={cellClasses}>
                    {inputFactory(obj, name, attrs, inputChangeFunction)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
