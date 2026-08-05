import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Repeat, Search, Wallet as WalletIcon, ShieldCheck, History, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketStore } from '../store/marketStore';
import { useTransactionHistory, useDepositMutation, useWithdrawMutation } from '../hooks/useWalletQueries';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { WALLET_SYMBOL_MAP } from '../data/pairs';
import { formatPrice } from '../utils/format';
import { theme } from '../theme';

const initialAssets = [
  { symbol: 'USDT', name: 'Tether', icon: '₮', spot: 2450.00, futures: 1200.00 },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', spot: 0.045, futures: 0.02 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', spot: 0.85, futures: 0.25 },
  { symbol: 'SOL', name: 'Solana', icon: 'S', spot: 12.4, futures: 5.0 },
  { symbol: 'BNB', name: 'BNB', icon: 'B', spot: 2.1, futures: 0.0 },
];

const REVERSE_SYMBOL_MAP = Object.fromEntries(
  Object.entries(WALLET_SYMBOL_MAP).map(([pairSymbol, coin]) => [coin, pairSymbol])
);

export const Wallet = () => {
  const { balances, updateBalance } = useAuth();
  const prices = useMarketStore((s) => s.prices);
  const isLive = useMarketStore((s) => s.isLive);

  const { data: transactions, isLoading: isTxLoading } = useTransactionHistory();
  const depositMutation = useDepositMutation();
  const withdrawMutation = useWithdrawMutation();

  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideSmall, setHideSmall] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const getLivePrice = (symbol) => {
    if (symbol === 'USDT') return 1;
    const pairSymbol = REVERSE_SYMBOL_MAP[symbol];
    return pairSymbol ? prices[pairSymbol]?.price ?? null : null;
  };

  const totalBalanceUSDT = useMemo(() => {
    return initialAssets.reduce((sum, item) => sum + (item.spot + item.futures) * (getLivePrice(item.symbol) || 0), 0);
  }, [prices]);

  const filteredAssets = useMemo(() => {
    return initialAssets.filter((item) => {
      const price = getLivePrice(item.symbol) || 0;
      const totalVal = (item.spot + item.futures) * price;
      const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSmall = hideSmall ? totalVal > 10 : true;
      return matchesSearch && matchesSmall;
    });
  }, [searchQuery, hideSmall, prices]);

  const handleDeposit = (amount) => {
    depositMutation.mutate(amount, { onSuccess: () => updateBalance('deposit', amount) });
  };

  const handleWithdraw = (amount) => {
    withdrawMutation.mutate(amount, { onSuccess: () => updateBalance('profit', -amount) });
  };

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: 'calc(100vh - 64px)', color: '#fff', padding: '40px 24px', fontFamily: theme.font.family }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ background: theme.colors.bgCard, padding: '32px', borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border}`, marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theme.colors.textSecondary, marginBottom: '8px', fontSize: '14px' }}>
                <WalletIcon size={18} /> Estimated Balance
                <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer', padding: 0 }}>
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={{ fontSize: '36px', fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: '6px' }}>
                {!showBalance ? '••••••••' : !isLive ? (
                  <span style={{ fontSize: '20px', color: theme.colors.textSecondary }}>Connecting to live prices...</span>
                ) : (
                  <>
                    {formatPrice(totalBalanceUSDT)}
                    <span style={{ fontSize: '16px', color: theme.colors.textSecondary, marginLeft: '8px', fontWeight: 'normal' }}>USDT</span>
                  </>
                )}
              </div>

              <div style={{ fontSize: '13px', color: theme.colors.positive, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Live Market Synchronized
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setIsDepositOpen(true)} style={{ background: theme.colors.accent, color: '#000', border: 'none', padding: '12px 24px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowDownLeft size={18} /> Deposit
              </button>
              <button onClick={() => setIsWithdrawOpen(true)} style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.borderStrong}`, padding: '12px 24px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpRight size={18} /> Withdraw
              </button>
              <button style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.borderStrong}`, padding: '12px 24px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={18} /> Transfer
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderBottom: `1px solid ${theme.colors.border}`, marginBottom: '24px', display: 'flex', gap: '24px' }}>
          {['overview', 'spot', 'futures'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ background: 'none', border: 'none', borderBottom: activeTab === tab ? `2px solid ${theme.colors.accent}` : '2px solid transparent', color: activeTab === tab ? theme.colors.accent : theme.colors.textSecondary, padding: '12px 0', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize' }}
            >
              {tab === 'overview' ? 'Assets Overview' : `${tab} Account`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search coin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, color: '#fff', borderRadius: theme.radius.sm, fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <label style={{ color: theme.colors.textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={hideSmall} onChange={(e) => setHideSmall(e.target.checked)} style={{ accentColor: theme.colors.accent }} />
            Hide small balances (&lt; $10)
          </label>
        </div>

        <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, overflow: 'hidden', marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}`, fontSize: '13px' }}>
                <th style={{ padding: '16px 24px' }}>Asset</th>
                <th>Last Price</th>
                <th>Spot Amount</th>
                <th>Futures Amount</th>
                <th>Total Value (USDT)</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((item) => {
                const livePrice = getLivePrice(item.symbol);
                const totalAmount = item.spot + item.futures;
                const totalUSD = livePrice !== null ? totalAmount * livePrice : null;

                return (
                  <tr key={item.symbol} style={{ borderBottom: `1px solid ${theme.colors.border}`, fontSize: '14px' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: theme.colors.bgInput, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.accent, fontWeight: 'bold' }}>
                          {item.icon}
                        </div>
                        <div>
                          <div>{item.symbol}</div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 'normal' }}>{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold', color: theme.colors.positive }}>
                      {!isLive || livePrice === null ? <span style={{ color: theme.colors.textSecondary }}>Loading...</span> : formatPrice(livePrice)}
                    </td>
                    <td>{showBalance ? item.spot : '••••'}</td>
                    <td>{showBalance ? item.futures : '••••'}</td>
                    <td style={{ fontWeight: 'bold', color: theme.colors.textPrimary }}>
                      {!showBalance ? '••••' : !isLive || totalUSD === null ? <span style={{ color: theme.colors.textSecondary }}>Loading...</span> : formatPrice(totalUSD)}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                      <button onClick={() => setIsDepositOpen(true)} style={{ background: 'none', border: 'none', color: theme.colors.accent, cursor: 'pointer', fontWeight: 'bold', marginRight: '16px', fontSize: '13px' }}>Deposit</button>
                      <button style={{ background: 'none', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Trade</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
            <History size={20} color={theme.colors.accent} /> Recent Transactions
          </div>

          <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
            {isTxLoading ? (
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: theme.colors.textSecondary, fontSize: '13px' }}>
                <Loader2 size={16} className="animate-spin" /> Loading transactions...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
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
            )}
          </div>
        </div>

      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} onDeposit={handleDeposit} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} profitBalance={balances.profit} onRequestWithdraw={handleWithdraw} />
    </div>
  );
};