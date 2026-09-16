import { useEffect, useRef } from 'react';
import { useMarketStore } from '../store/marketStore';
import { supabase } from '../lib/supabaseClient';

// Trade page খোলা থাকা অবস্থায় real-time price দেখে সাথে সাথে liquidation
// trigger করে (instant UX) - browser বন্ধ থাকলে Edge Function+cron ব্যাকআপ হিসেবে কাজ করে
export const useLiquidationWatcher = (openPositions) => {
  const prices = useMarketStore((s) => s.prices);
  const checkingRef = useRef(new Set());

  useEffect(() => {
    if (!openPositions || openPositions.length === 0) return;

    openPositions.forEach(async (pos) => {
      const currentPrice = prices[pos.symbol]?.price;
      if (!currentPrice || checkingRef.current.has(pos.id)) return;

      const shouldLiquidate =
        pos.type === 'LONG' ? currentPrice <= pos.liquidation_price : currentPrice >= pos.liquidation_price;

      if (shouldLiquidate) {
        checkingRef.current.add(pos.id);
        try {
          await supabase.rpc('process_liquidation_check', {
            p_position_id: pos.id,
            p_current_price: currentPrice,
          });
        } finally {
          checkingRef.current.delete(pos.id);
        }
      }
    });
  }, [prices, openPositions]);
};