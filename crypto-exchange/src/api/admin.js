import { supabase } from '../lib/supabaseClient';

export const fetchPendingWithdrawals = async () => {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*, profiles(email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const fetchNeedsReviewDeposits = async () => {
  const { data, error } = await supabase
    .from('deposits')
    .select('*, profiles(email)')
    .eq('status', 'needs_review')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const approveWithdrawal = async (withdrawalId) => {
  const { data, error } = await supabase.rpc('admin_approve_withdrawal', { p_withdrawal_id: withdrawalId });
  if (error) throw error;
  return data;
};

export const rejectWithdrawal = async (withdrawalId) => {
  const { data, error } = await supabase.rpc('admin_reject_withdrawal', { p_withdrawal_id: withdrawalId });
  if (error) throw error;
  return data;
};

export const resolveDeposit = async (depositId) => {
  const { data, error } = await supabase.rpc('admin_resolve_deposit', { p_deposit_id: depositId });
  if (error) throw error;
  return data;
};