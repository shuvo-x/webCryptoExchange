import { describe, it, expect, beforeEach } from 'vitest';
import { useMarketStore } from '../marketStore';
import { PAIRS } from '../../data/pairs';

describe('marketStore', () => {
  beforeEach(() => {
    useMarketStore.setState({
      prices: Object.fromEntries(PAIRS.map((p) => [p.symbol, { ...p.fallback }])),
      isLive: false,
    });
  });

  it('initializes prices for every tracked pair', () => {
    const { prices } = useMarketStore.getState();
    PAIRS.forEach((pair) => expect(prices[pair.symbol]).toBeDefined());
  });

  it('updatePrices merges new data without dropping other symbols', () => {
    const { updatePrices } = useMarketStore.getState();
    updatePrices({ BTCUSDT: { price: 99999, change: 1, high: 100000, low: 99000, volume: 1 } });
    const { prices } = useMarketStore.getState();
    expect(prices.BTCUSDT.price).toBe(99999);
    expect(prices.ETHUSDT).toBeDefined();
  });

  it('setLive updates isLive flag', () => {
    useMarketStore.getState().setLive(true);
    expect(useMarketStore.getState().isLive).toBe(true);
  });
});