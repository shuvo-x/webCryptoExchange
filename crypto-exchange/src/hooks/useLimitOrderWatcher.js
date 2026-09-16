import { useEffect, useRef } from 'react';
import { useMarketStore } from '../store/marketStore';
import { supabase } from '../lib/supabaseClient';

export const useLimitOrderWatcher = (pendingOrders) => {
  const prices = useMarketStore((s) => s.prices);
  const checkingRef = useRef(new Set());

  useEffect(() => {
    if (!pendingOrders || pendingOrders.length === 0) return;

    pendingOrders.forEach(async (order) => {
      const currentPrice = prices[order.symbol]?.price;
      if (!currentPrice || checkingRef.current.has(order.id)) return;

      const shouldFill =
        order.type === 'LONG' ? currentPrice <= order.target_price : currentPrice >= order.target_price;

      if (shouldFill) {
        checkingRef.current.add(order.id);
        try {
          await supabase.rpc('process_limit_order_check', { p_order_id: order.id, p_current_price: currentPrice });
        } finally {
          checkingRef.current.delete(order.id);
        }
      }
    });
  }, [prices, pendingOrders]);
};