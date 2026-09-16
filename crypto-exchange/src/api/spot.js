import { supabase } from '../lib/supabaseClient';

export const fetchMyHoldings = async (userId) => {
  const { data, error } = await supabase.from('spot_holdings').select('*').eq('user_id', userId);
  if (error) throw error;
  return data;
};

export const spotBuy = async ({ coinSymbol, price, quoteAmount }) => {
  const { data, error } = await supabase.rpc('spot_buy', {
    p_coin_symbol: coinSymbol,
    p_price: price,
    p_quote_amount: quoteAmount,
  });
  if (error) throw error;
  return data;
};

export const spotSell = async ({ coinSymbol, price, quantity }) => {
  const { data, error } = await supabase.rpc('spot_sell', {
    p_coin_symbol: coinSymbol,
    p_price: price,
    p_quantity: quantity,
  });
  if (error) throw error;
  return data;
};