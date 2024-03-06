import { Fragment, React } from 'react';

// Utility Functions
export function fieldToHeaderString(field) {
  const words = field.split('_');
  const capitalized = words.map(
    (word) => word.slice(0, 1).toUpperCase() + word.slice(1)
  );
  return capitalized.join(' ');
}

// Utility Components
export function SKUDescription({ sku }) {
  return (
    <span style={{ fontSize: '18px', color: '#bbb' }}>{sku.description}</span>
  );
}

export function MinMax({ value, unit = 'mm' }) {
  return `${value.min} - ${value.max} ${unit}`;
}

export function BooleanCheckbox({ value }) {
  return value ? '✅' : '';
}

export function DateComponent({ value }) {
  return new Date(value).toLocaleDateString();
}

export function CurrencyComponent({ value }) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'long',
    minimumFractionDigits: 2,
  }).format(value);
}

export function TransmissionTable({ sku, wavelengths }) {
  return (
    <div className="sku-detail-block">
      <div className="block-header">Minimum Transmission</div>
      <div
        className="block-body"
        style={{ display: 'grid', gridTemplateColumns: `repeat(2, 1fr)` }}
      >
        {wavelengths.map((wavelength) => (
          <Fragment key={wavelength}>
            <span style={{ textAlign: 'right' }}>{wavelength}</span>
            <span style={{ textAlign: 'left' }}>
              {sku[`min_trans_${wavelength}`]}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function SKUDetailData({ sku, fieldOptions }) {
  const fieldArr = Object.entries(fieldOptions);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {fieldArr.map(([field, options]) => {
        const value = sku[field];
        return (
          <Fragment key={field}>
            <span>{options.header ?? fieldToHeaderString(field)}</span>
            <span>{options.body ? <options.body value={value} /> : value}</span>
          </Fragment>
        );
      })}
    </div>
  );
}
