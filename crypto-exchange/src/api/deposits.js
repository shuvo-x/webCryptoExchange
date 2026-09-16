import { supabase } from '../lib/supabaseClient';

// Deposit request তৈরি - server-side function ব্যবহার করে, যাতে
// client নিজে থেকে exact_amount বানাতে/বদলাতে না পারে
export const createDepositRequest = async (amount) => {
  const { data, error } = await supabase.rpc('create_deposit_request', { p_amount: amount });
  if (error) throw error;
  return data;
};

// একটা নির্দিষ্ট deposit-এর current status আনার জন্য (polling-এ ব্যবহৃত হবে)
export const fetchDepositById = async (depositId) => {
  const { data, error } = await supabase.from('deposits').select('*').eq('id', depositId).single();
  if (error) throw error;
  return data;
};