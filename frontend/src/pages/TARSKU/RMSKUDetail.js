/* eslint-disable react/jsx-props-no-spreading */
import { React } from 'react';
import {
  BooleanCheckbox,
  CurrencyComponent,
  DateComponent,
  SKUDescription,
  SKUDetailData,
  TransmissionTable,
} from './utils';

const RMDetailOptions = {
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
  category: {},
  active: {
    body: BooleanCheckbox,
  },
  special: {
    body: BooleanCheckbox,
  },
  notes: {},
  vendor_sku: {
    header: 'Vendor SKU',
  },
};

// Note: NavButton prop is currently unused in RM SKU
// But is declared so that it's not sent along with rest
// to the HTML div. React throws an error if this happens
export default function RMSKUDetail({ sku, NavButton, ...rest }) {
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
            <SKUDetailData sku={sku} fieldOptions={RMDetailOptions} />
          </div>
          <TransmissionTable sku={sku} wavelengths={['300', '500', '1385']} />
        </div>
      </div>
    </div>
  );
}
