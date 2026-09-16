import { supabase } from '../lib/supabaseClient';

export const fetchMyLimitOrders = async (userId) => {
  const { data, error } = await supabase
    .from('limit_orders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createLimitOrder = async ({ symbol, type, leverage, margin, targetPrice }) => {
  const { data, error } = await supabase.rpc('create_limit_order', {
    p_symbol: symbol,
    p_type: type,
    p_leverage: leverage,
    p_margin: margin,
    p_target_price: targetPrice,
  });
  if (error) throw error;
  return data;
};

export const cancelLimitOrder = async (orderId) => {
  const { data, error } = await supabase.rpc('cancel_limit_order', { p_order_id: orderId });
  if (error) throw error;
  return data;
};