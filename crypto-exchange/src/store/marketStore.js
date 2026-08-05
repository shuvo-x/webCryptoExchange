import { create } from 'zustand';
import { PAIRS } from '../data/pairs';

// Context API-এর জায়গায় Zustand - Context বদলালে provider-এর নিচের সব consumer re-render হয়,
// even যদি তারা অন্য symbol দেখে। Zustand selector দিয়ে শুধু subscribed slice বদলালেই re-render হয়।
const buildInitialPrices = () => {
  const initial = {};
  PAIRS.forEach((pair) => {
    initial[pair.symbol] = { ...pair.fallback };
  });
  return initial;
};

export const useMarketStore = create((set) => ({
  prices: buildInitialPrices(),
  isLive: false,
  setLive: (val) => set({ isLive: val }),
  updatePrices: (updates) =>
    set((state) => ({ prices: { ...state.prices, ...updates } })),
}));