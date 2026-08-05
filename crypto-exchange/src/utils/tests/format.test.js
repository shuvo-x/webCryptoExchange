import { describe, it, expect } from 'vitest';
import { formatPrice, formatPercent, formatVolume } from '../format';

describe('formatPrice', () => {
  it('formats large prices with 2 decimals', () => {
    expect(formatPrice(89450)).toBe('$89,450.00');
  });
  it('formats small prices (<1) with 4 decimals', () => {
    expect(formatPrice(0.585)).toBe('$0.5850');
  });
  it('returns -- for null/undefined/NaN', () => {
    expect(formatPrice(null)).toBe('--');
    expect(formatPrice(undefined)).toBe('--');
    expect(formatPrice(NaN)).toBe('--');
  });
});

describe('formatPercent', () => {
  it('adds + sign for positive values', () => {
    expect(formatPercent(2.456)).toBe('+2.46%');
  });
  it('keeps - sign for negative values', () => {
    expect(formatPercent(-1.1)).toBe('-1.10%');
  });
});

describe('formatVolume', () => {
  it('formats billions', () => {
    expect(formatVolume(24_500_000_000)).toBe('$24.5B');
  });
  it('formats thousands as K', () => {
    expect(formatVolume(980_000)).toBe('$980.0K');
  });
});