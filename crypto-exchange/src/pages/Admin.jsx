import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  usePendingWithdrawals,
  useNeedsReviewDeposits,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useResolveDeposit,
} from '../hooks/useAdminQueries';
import { theme } from '../theme';

export const Admin = () => {
  const { isAdmin, loading } = useAuth();

  const { data: withdrawals, isLoading: isWLoading } = usePendingWithdrawals();
  const { data: reviewDeposits, isLoading: isDLoading } = useNeedsReviewDeposits();

  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();
  const resolveDeposit = useResolveDeposit();

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleApprove = (id) => {
    if (confirm('নিশ্চিত করছেন এই withdrawal সত্যিই আপনি manually পাঠিয়ে দিয়েছেন?')) {
      approveWithdrawal.mutate(id);
    }
  };

  const handleReject = (id) => {
    if (confirm('Reject করলে user-এর balance ফেরত যাবে। নিশ্চিত?')) {
      rejectWithdrawal.mutate(id);
    }
  };

  const handleResolveDeposit = (id) => {
    if (confirm('এই deposit-টা নিশ্চিতভাবে এই user-এর, এবং balance credit করে দিতে চান?')) {
      resolveDeposit.mutate(id);
    }
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: 'calc(100vh - 64px)', color: '#fff', padding: '40px 24px', fontFamily: theme.font.family }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <ShieldAlert size={28} color={theme.colors.accent} />
          <h1 style={{ fontSize: '26px', margin: 0 }}>Admin Panel</h1>
        </div>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Pending Withdrawals
            {withdrawals && withdrawals.length > 0 && (
              <span style={{ background: theme.colors.negativeBg, color: theme.colors.negative, fontSize: '12px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                {withdrawals.length}
              </span>
            )}
          </h2>

          <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
            {isWLoading ? (
              <div style={{ padding: '24px', color: theme.colors.textSecondary, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Loader2 size={16} className="animate-spin" /> Loading...
              </div>
            ) : !withdrawals || withdrawals.length === 0 ? (
              <div style={{ padding: '24px', color: theme.colors.textSecondary, fontSize: '13px' }}>কোনো pending withdrawal নেই।</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}` }}>
                    <th style={{ padding: '12px 16px' }}>User</th>
                    <th>Amount</th>
                    <th>Address</th>
                    <th>Requested</th>
                    <th style={{ textAlign: 'right', paddingRight: '16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '12px 16px' }}>{w.profiles?.email ?? w.user_id}</td>
                      <td style={{ color: theme.colors.accent, fontWeight: 'bold' }}>{w.amount} USDT</td>
                      <td style={{ fontSize: '11px', color: theme.colors.textSecondary, wordBreak: 'break-all', maxWidth: '160px' }}>{w.wallet_address}</td>
                      <td style={{ color: theme.colors.textSecondary }}>{new Date(w.created_at).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                        <button
                          onClick={() => handleApprove(w.id)}
                          disabled={approveWithdrawal.isPending}
                          style={{ background: theme.colors.positive, color: '#000', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(w.id)}
                          disabled={rejectWithdrawal.isPending}
                          style={{ background: theme.colors.negative, color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          <XCircle size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color={theme.colors.accent} /> Deposits Needing Review
            {reviewDeposits && reviewDeposits.length > 0 && (
              <span style={{ background: theme.colors.accentBg, color: theme.colors.accent, fontSize: '12px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                {reviewDeposits.length}
              </span>
            )}
          </h2>

          <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
            {isDLoading ? (
              <div style={{ padding: '24px', color: theme.colors.textSecondary, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Loader2 size={16} className="animate-spin" /> Loading...
              </div>
            ) : !reviewDeposits || reviewDeposits.length === 0 ? (
              <div style={{ padding: '24px', color: theme.colors.textSecondary, fontSize: '13px' }}>কোনো deposit review-এর প্রয়োজন নেই।</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}` }}>
                    <th style={{ padding: '12px 16px' }}>User</th>
                    <th>Amount</th>
                    <th>Exact Amount</th>
                    <th>Tx Hash</th>
                    <th style={{ textAlign: 'right', paddingRight: '16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewDeposits.map((d) => (
                    <tr key={d.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                      <td style={{ padding: '12px 16px' }}>{d.profiles?.email ?? d.user_id}</td>
                      <td style={{ color: theme.colors.accent, fontWeight: 'bold' }}>{d.expected_amount} USDT</td>
                      <td style={{ color: theme.colors.textSecondary }}>{d.exact_amount}</td>
                      <td style={{ fontSize: '11px', color: theme.colors.textSecondary, wordBreak: 'break-all', maxWidth: '160px' }}>{d.tx_hash ?? '—'}</td>
                      <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                        <button
                          onClick={() => handleResolveDeposit(d.id)}
                          disabled={resolveDeposit.isPending}
                          style={{ background: theme.colors.positive, color: '#000', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Confirm & Credit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};