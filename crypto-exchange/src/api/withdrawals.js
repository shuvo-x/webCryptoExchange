import { supabase } from '../lib/supabaseClient';

export const createWithdrawRequest = async ({ amount, walletAddress }) => {
  const { data, error } = await supabase.rpc('create_withdraw_request', {
    p_amount: amount,
    p_wallet_address: walletAddress,
  });
  if (error) throw error;
  return data;
};

export const fetchMyWithdrawals = async (userId) => {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};