import React from 'react';

export default function TableTemplate({
  headerRows,
  bodyRows,
  extraClasses,
  ...props
}) {
  let classes = ['tsw-table', 'striped', 'rounded', 'bordered'];
  if (extraClasses) classes = [...classes, ...extraClasses];

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div className={classes.join(' ')} {...props}>
      <table>
        {headerRows && <thead>{headerRows}</thead>}
        {bodyRows && <tbody>{bodyRows}</tbody>}
      </table>
    </div>
  );
}
