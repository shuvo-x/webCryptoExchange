import { supabase } from '../lib/supabaseClient';

// আগে এই ফাইল client.js-এর mock data থেকে fake transaction history দিত।
// এখন deposits + withdrawals table থেকে real ইতিহাস মিলিয়ে দেখানো হচ্ছে।
export const fetchTransactions = async (userId) => {
  const [depositsRes, withdrawalsRes] = await Promise.all([
    supabase
      .from('deposits')
      .select('id, expected_amount, status, created_at, confirmed_at')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .order('confirmed_at', { ascending: false }),
    supabase
      .from('withdrawals')
      .select('id, amount, status, created_at, processed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (depositsRes.error) throw depositsRes.error;
  if (withdrawalsRes.error) throw withdrawalsRes.error;

  const depositTx = (depositsRes.data ?? []).map((d) => ({
    id: d.id.slice(0, 8),
    type: 'Deposit',
    amount: `+${Number(d.expected_amount).toFixed(2)} USDT`,
    date: new Date(d.confirmed_at ?? d.created_at).toLocaleString(),
    status: 'Completed',
  }));

  const withdrawTx = (withdrawalsRes.data ?? []).map((w) => ({
    id: w.id.slice(0, 8),
    type: 'Withdraw',
    amount: `-${Number(w.amount).toFixed(2)} USDT`,
    date: new Date(w.created_at).toLocaleString(),
    status: w.status === 'successful' ? 'Completed' : w.status === 'rejected' ? 'Rejected' : 'Pending',
  }));

  return [...depositTx, ...withdrawTx].sort((a, b) => new Date(b.date) - new Date(a.date));
};