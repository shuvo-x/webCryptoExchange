import { describe, it, expect } from 'vitest';
import { calculatePnL, calculateLiquidationPrice } from '../pnl';

describe('calculatePnL', () => {
  it('gives positive PnL for LONG when price goes up', () => {
    const pos = { type: 'LONG', entryPrice: 100, margin: 10, leverage: 10 };
    expect(calculatePnL(pos, 110)).toBeCloseTo(10, 5);
  });

  it('gives negative PnL for LONG when price goes down', () => {
    const pos = { type: 'LONG', entryPrice: 100, margin: 10, leverage: 10 };
    expect(calculatePnL(pos, 90)).toBeCloseTo(-10, 5);
  });

  it('gives positive PnL for SHORT when price goes down', () => {
    const pos = { type: 'SHORT', entryPrice: 100, margin: 10, leverage: 10 };
    expect(calculatePnL(pos, 90)).toBeCloseTo(10, 5);
  });

  it('gives negative PnL for SHORT when price goes up', () => {
    const pos = { type: 'SHORT', entryPrice: 100, margin: 10, leverage: 10 };
    expect(calculatePnL(pos, 110)).toBeCloseTo(-10, 5);
  });

  it('returns 0 when currentPrice is missing', () => {
    const pos = { type: 'LONG', entryPrice: 100, margin: 10, leverage: 10 };
    expect(calculatePnL(pos, null)).toBe(0);
  });
});

describe('calculateLiquidationPrice', () => {
  it('is below entry price for LONG', () => {
    expect(calculateLiquidationPrice(100, 10, 'LONG')).toBe(90);
  });
  it('is above entry price for SHORT', () => {
    expect(calculateLiquidationPrice(100, 10, 'SHORT')).toBe(110);
  });
  it('higher leverage means liquidation price closer to entry', () => {
    const liqLowLev = calculateLiquidationPrice(100, 5, 'LONG');
    const liqHighLev = calculateLiquidationPrice(100, 50, 'LONG');
    expect(liqHighLev).toBeGreaterThan(liqLowLev);
  });
});