import { useCallback } from 'react';
import { useExchangeSocket } from './useExchangeSocket';
import { useMarketStore } from '../store/marketStore';
import { PAIRS } from '../data/pairs';

const TRACKED_SYMBOLS = new Set(PAIRS.map((p) => p.symbol));

// App root-এ একবারই call হবে - পুরো app-এর জন্য একটাই WebSocket connection
export const useMarketDataSocket = () => {
  const updatePrices = useMarketStore((s) => s.updatePrices);
  const setLive = useMarketStore((s) => s.setLive);

  const handleMessage = useCallback(
    (data) => {
      const updates = {};
      data.forEach((ticker) => {
        if (!TRACKED_SYMBOLS.has(ticker.s)) return;
        const closePrice = parseFloat(ticker.c);
        const openPrice = parseFloat(ticker.o);
        updates[ticker.s] = {
          price: closePrice,
          change: openPrice ? ((closePrice - openPrice) / openPrice) * 100 : 0,
          high: parseFloat(ticker.h),
          low: parseFloat(ticker.l),
          volume: parseFloat(ticker.q),
        };
      });
      if (Object.keys(updates).length > 0) {
        updatePrices(updates);
        setLive(true);
      }
    },
    [updatePrices, setLive]
  );

  useExchangeSocket({
    url: 'wss://stream.binance.com:9443/ws/!miniTicker@arr',
    onMessage: handleMessage,
  });
};