import { supabase } from '../lib/supabaseClient';

export const fetchMyPositions = async (userId) => {
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const openPosition = async ({ symbol, type, leverage, margin, entryPrice, liquidationPrice }) => {
  const { data, error } = await supabase.rpc('open_position', {
    p_symbol: symbol,
    p_type: type,
    p_leverage: leverage,
    p_margin: margin,
    p_entry_price: entryPrice,
    p_liquidation_price: liquidationPrice,
  });
  if (error) throw error;
  return data;
};

export const closePosition = async ({ positionId, closePrice }) => {
  const { data, error } = await supabase.rpc('close_position', {
    p_position_id: positionId,
    p_close_price: closePrice,
  });
  if (error) throw error;
  return data;
};