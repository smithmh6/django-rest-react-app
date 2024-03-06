/* eslint-disable react/jsx-props-no-spreading */
import { React } from 'react';
import {
  BooleanCheckbox,
  CurrencyComponent,
  DateComponent,
  MinMax,
  SKUDescription,
  SKUDetailData,
  TransmissionTable,
} from './utils';

const OCDetailOptions = {
  diameter: {
    body: MinMax,
  },
  thickness: {
    body: MinMax,
  },
  created: {
    body: DateComponent,
  },
  modified: {
    body: DateComponent,
  },
  cost: {
    body: CurrencyComponent,
  },
  stock_min: {},
  active: {
    body: BooleanCheckbox,
  },
  special: {
    body: BooleanCheckbox,
  },
  scratch: {},
  dig: {},
  notes: {},
  rm_sku: {
    header: 'RM SKU',
  },
};

export default function OCSKUDetail({ sku, NavButton, ...rest }) {
  const fieldOptions = {
    ...OCDetailOptions,
    rm_sku: {
      header: 'RM SKU',
      body: NavButton,
    },
  };

  return (
    <div className="tar-skus tsw-form" {...rest}>
      <div className="form-header">{sku.name}</div>
      <div className="form-body" style={{ alignItems: 'flex-start' }}>
        <div className="horizontal-wrapper" style={{ width: '100%' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5em',
            }}
          >
            <SKUDescription sku={sku} />
            <SKUDetailData sku={sku} fieldOptions={fieldOptions} />
          </div>
          <TransmissionTable
            sku={sku}
            wavelengths={[
              '300',
              '500',
              '700',
              '900',
              '1100',
              '1300',
              '1500',
              '1650',
            ]}
          />
        </div>
      </div>
    </div>
  );
}
