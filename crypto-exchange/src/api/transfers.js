import { supabase } from '../lib/supabaseClient';

export const transferSpotToFutures = async (amount) => {
  const { data, error } = await supabase.rpc('transfer_spot_to_futures', { p_amount: amount });
  if (error) throw error;
  return data;
};

export const transferFuturesToSpot = async (amount) => {
  const { data, error } = await supabase.rpc('transfer_futures_to_spot', { p_amount: amount });
  if (error) throw error;
  return data;
};