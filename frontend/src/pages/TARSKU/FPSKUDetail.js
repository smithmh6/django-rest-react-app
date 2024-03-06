/* eslint-disable react/jsx-props-no-spreading */
import { React } from 'react';
import {
  BooleanCheckbox,
  CurrencyComponent,
  DateComponent,
  SKUDescription,
  SKUDetailData,
} from './utils';

const FPDetailOptions = {
  created: {
    body: DateComponent,
  },
  modified: {
    body: DateComponent,
  },
  released: {
    body: DateComponent,
  },
  cost: {
    body: CurrencyComponent,
  },
  price: {
    body: CurrencyComponent,
  },
  stock_min: {},
  category: {},
  active: {
    body: BooleanCheckbox,
  },
  special: {
    body: BooleanCheckbox,
  },
  notes: {},
};

export default function FPSKUDetail({ sku, NavButton, ...rest }) {
  const fieldOptions = {
    ...FPDetailOptions,
    oc_sku: {
      header: 'OC SKU',
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
        </div>
      </div>
    </div>
  );
}
