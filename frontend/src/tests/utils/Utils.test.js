import { nextBatchNumber } from '../../common/Utils';

describe('nextBatchNumber', () => {
  test('returns empty string with undefined', () => {
    expect(nextBatchNumber(undefined)).toBe('');
  });

  test('returns correct numbers', () => {
    expect(nextBatchNumber('TAR000000')).toBe('TAR000001');
    expect(nextBatchNumber('CB000005')).toBe('CB000006');
    expect(nextBatchNumber('ABCDEF000123')).toBe('ABCDEF000124');
  });
});
