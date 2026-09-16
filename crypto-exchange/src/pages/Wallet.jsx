import React, { useState, useMemo, useEffect } from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Repeat, Wallet as WalletIcon, ShieldCheck, History, Loader2, ArrowUpCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketStore } from '../store/marketStore';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useTransactionHistory, useMyWithdrawals } from '../hooks/useWalletQueries';
import { useMyPositions } from '../hooks/usePositions';
import { calculatePnL } from '../utils/pnl';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { TransferModal } from '../components/TransferModel';
import { BonusClaimCard } from '../components/BonusClaimCard';
import { formatPrice } from '../utils/format';
import { theme } from '../theme';

const WITHDRAW_STATUS_STYLE = {
  pending: { bg: 'rgba(240, 185, 11, 0.1)', color: '#f0b90b', label: 'Pending' },
  successful: { bg: 'rgba(14, 203, 129, 0.1)', color: '#0ecb81', label: 'Successful' },
  rejected: { bg: 'rgba(246, 70, 93, 0.1)', color: '#f6465d', label: 'Rejected' },
};

const BalanceCard = ({ icon, label, amount, footer, showBalance }) => (
  <div style={{ background: theme.colors.bgCard, padding: '20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, flex: 1, minWidth: '200px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textSecondary, fontSize: '13px', marginBottom: '10px' }}>
      {icon} {label}
    </div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.textPrimary }}>
      {showBalance ? formatPrice(amount) : '••••'}
    </div>
    {footer && <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginTop: '6px' }}>{footer}</div>}
  </div>
);

export const Wallet = () => {
  const { balances, bonusLockedAmount, refreshProfile } = useAuth();
  const prices = useMarketStore((s) => s.prices);
  const isMobile = useIsMobile();

  const { data: transactions, isLoading: isTxLoading } = useTransactionHistory();
  const { data: myWithdrawals, isLoading: isWLoading } = useMyWithdrawals();
  const { data: allPositions } = useMyPositions();

  const [showBalance, setShowBalance] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const openPositions = useMemo(() => (allPositions ?? []).filter((p) => p.status === 'OPEN'), [allPositions]);

  // Open position-গুলোর unrealized PnL live হিসাব করে Futures balance-এ যোগ করা হচ্ছে -
  // এতে market move করলে সাথে সাথে Wallet-এর balance-ও ওঠানামা করবে
  const unrealizedPnL = useMemo(() => {
    return openPositions.reduce((sum, pos) => {
      const livePrice = prices[pos.symbol]?.price;
      return sum + calculatePnL(pos, livePrice);
    }, 0);
  }, [openPositions, prices]);

  const lockedMargin = useMemo(() => openPositions.reduce((sum, pos) => sum + Number(pos.margin), 0), [openPositions]);

  const displayFuturesBalance = balances.futures + lockedMargin + unrealizedPnL;
  const totalBalanceUSDT = balances.spot + displayFuturesBalance;

  const futuresFooter = bonusLockedAmount > 0
    ? `$${bonusLockedAmount.toFixed(2)} bonus locked | Unrealized: ${unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}`
    : `Unrealized PnL: ${unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}`;

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: 'calc(100vh - 64px)', color: '#fff', padding: isMobile ? '20px 12px' : '40px 24px', fontFamily: theme.font.family }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <BonusClaimCard />

        <div style={{ background: theme.colors.bgCard, padding: isMobile ? '20px' : '32px', borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border}`, marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.colors.textSecondary, marginBottom: '8px', fontSize: '14px' }}>
                <WalletIcon size={18} /> Total Estimated Balance
                <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer', padding: 0 }}>
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', color: theme.colors.textPrimary }}>
                {showBalance ? formatPrice(totalBalanceUSDT) : '••••••••'}
                <span style={{ fontSize: '16px', color: theme.colors.textSecondary, marginLeft: '8px', fontWeight: 'normal' }}>USDT</span>
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.positive, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <ShieldCheck size={16} /> Spot + Futures মিলিয়ে
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setIsDepositOpen(true)} style={{ background: theme.colors.accent, color: '#000', border: 'none', padding: '12px 24px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowDownLeft size={18} /> Deposit
              </button>
              <button onClick={() => setIsWithdrawOpen(true)} style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.borderStrong}`, padding: '12px 24px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpRight size={18} /> Withdraw
              </button>
              <button onClick={() => setIsTransferOpen(true)} style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.borderStrong}`, padding: '12px 24px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={18} /> Transfer
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <BalanceCard icon={<WalletIcon size={16} />} label="Spot Wallet" amount={balances.spot} footer="Withdrawable" showBalance={showBalance} />
          <BalanceCard icon={<TrendingUp size={16} />} label="Futures Wallet" amount={displayFuturesBalance} footer={futuresFooter} showBalance={showBalance} />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            <History size={20} color={theme.colors.accent} /> Recent Transactions
          </div>

          <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
            {isTxLoading ? (
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textSecondary, fontSize: '13px' }}>
                <Loader2 size={16} className="animate-spin" /> Loading transactions...
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div style={{ padding: '24px', color: theme.colors.textSecondary, fontSize: '13px' }}>
                এখনো কোনো transaction হয়নি।
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}` }}>
                      <th style={{ padding: '14px 24px' }}>Tx ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date & Time</th>
                      <th style={{ textAlign: 'right', paddingRight: '24px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const isPositiveTx = tx.amount.startsWith('+');
                      return (
                        <tr key={tx.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                          <td style={{ padding: '14px 24px', color: theme.colors.textSecondary }}>{tx.id}</td>
                          <td style={{ fontWeight: 'bold' }}>{tx.type}</td>
                          <td style={{ color: isPositiveTx ? theme.colors.positive : theme.colors.negative, fontWeight: 'bold' }}>{tx.amount}</td>
                          <td style={{ color: theme.colors.textSecondary }}>{tx.date}</td>
                          <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                            <span style={{ background: theme.colors.positiveBg, color: theme.colors.positive, padding: '4px 8px', borderRadius: theme.radius.sm, fontSize: '12px', fontWeight: 'bold' }}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            <ArrowUpCircle size={20} color={theme.colors.accent} /> Withdrawal History
          </div>

          <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
            {isWLoading ? (
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textSecondary, fontSize: '13px' }}>
                <Loader2 size={16} className="animate-spin" /> Loading withdrawal history...
              </div>
            ) : !myWithdrawals || myWithdrawals.length === 0 ? (
              <div style={{ padding: '24px', color: theme.colors.textSecondary, fontSize: '13px' }}>এখনো কোনো withdrawal request করেননি।</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}` }}>
                      <th style={{ padding: '14px 24px' }}>Amount</th>
                      <th>Address</th>
                      <th>Requested</th>
                      <th style={{ textAlign: 'right', paddingRight: '24px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myWithdrawals.map((w) => {
                      const style = WITHDRAW_STATUS_STYLE[w.status] ?? WITHDRAW_STATUS_STYLE.pending;
                      return (
                        <tr key={w.id} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                          <td style={{ padding: '14px 24px', fontWeight: 'bold' }}>{w.amount} USDT</td>
                          <td style={{ color: theme.colors.textSecondary, fontSize: '11px', wordBreak: 'break-all', maxWidth: '180px' }}>{w.wallet_address}</td>
                          <td style={{ color: theme.colors.textSecondary }}>{new Date(w.created_at).toLocaleString()}</td>
                          <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                            <span style={{ background: style.bg, color: style.color, padding: '4px 8px', borderRadius: theme.radius.sm, fontSize: '12px', fontWeight: 'bold' }}>
                              {style.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </div>
  );
};