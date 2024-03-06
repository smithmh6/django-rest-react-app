// eslint-disable-next-line import/prefer-default-export
export function nextBatchNumber(batchNumber) {
  if (!batchNumber) return '';
  // Will need to be updated once one of the batches rolls over.
  // For now, we assume 6 decimal places in the ID.
  const numLength = 6;
  const splitPoint = batchNumber.length - numLength;
  const batchPrefix = batchNumber.substring(0, splitPoint);
  const newBatchNumber = Number(batchNumber.substring(splitPoint)) + 1;

  // Pad with zeroes
  let newNumberString = String(newBatchNumber);
  while (newNumberString.length < numLength) {
    newNumberString = `0${newNumberString}`;
  }

  return batchPrefix + newNumberString;
}
