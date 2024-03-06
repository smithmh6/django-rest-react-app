function buildDateString(val) {
  return new Date(val).toLocaleDateString();
}

function buildDateTimeString(val) {
  return new Date(val).toLocaleString().replace(',', '');
}

function buildCurrencyString(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'long',
    minimumFractionDigits: 2,
  }).format(val);
}

export default function stringBuilder(obj, key, attrs) {
  if (attrs.dataType === 'date') {
    return buildDateString(obj[key]);
  }

  if (attrs.dataType === 'datetime') {
    return buildDateTimeString(obj[key]);
  }

  if (attrs.dataType === 'currency') {
    return buildCurrencyString(obj[key]);
  }

  return obj[key];
}
