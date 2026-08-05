import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Flame, Sparkles } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { PAIRS } from '../data/pairs';
import { formatPrice, formatPercent, formatVolume } from '../utils/format';
import { theme } from '../theme';

const HighlightCard = ({ symbol, label, iconColor, icon, pairLabel, name }) => {
  const live = useMarketStore((s) => s.prices[symbol]);
  const isLive = useMarketStore((s) => s.isLive);
  const isPositive = live.change >= 0;

  return (
    <div style={{ background: theme.colors.bgCard, padding: '20px', borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: iconColor, fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>
        {icon} {label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{pairLabel}</div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>{name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: theme.colors.positive }}>
            {!isLive ? <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>Connecting...</span> : formatPrice(live.price)}
          </div>
          <div style={{ fontSize: '12px', color: isPositive ? theme.colors.positive : theme.colors.negative }}>{formatPercent(live.change)}</div>
        </div>
      </div>
    </div>
  );
};

const PairRow = ({ pair, navigate }) => {
  const live = useMarketStore((s) => s.prices[pair.symbol]);
  const isLive = useMarketStore((s) => s.isLive);
  const isPositive = live.change >= 0;

  return (
    <tr style={{ borderBottom: `1px solid ${theme.colors.border}`, fontSize: '14px' }}>
      <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{pair.symbol}</span>
          <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 'normal' }}>{pair.name}</span>
        </div>
      </td>
      <td style={{ fontWeight: 'bold' }}>
        {!isLive ? <span style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>Connecting...</span> : <span style={{ color: isPositive ? theme.colors.positive : theme.colors.negative }}>{formatPrice(live.price)}</span>}
      </td>
      <td>
        <span style={{ background: isPositive ? theme.colors.positiveBg : theme.colors.negativeBg, color: isPositive ? theme.colors.positive : theme.colors.negative, padding: '4px 8px', borderRadius: theme.radius.sm, fontSize: '12px', fontWeight: 'bold' }}>
          {formatPercent(live.change)}
        </span>
      </td>
      <td style={{ color: theme.colors.textPrimary }}>{formatPrice(live.high)}</td>
      <td style={{ color: theme.colors.textSecondary }}>{formatVolume(live.volume)}</td>
      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
        <button onClick={() => navigate(`/trade/${pair.symbol}`)} style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.borderStrong}`, padding: '6px 16px', borderRadius: theme.radius.sm, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          Trade
        </button>
      </td>
    </tr>
  );
};

export const Markets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPairs = useMemo(() => {
    return PAIRS.filter((pair) => {
      const matchesTab = activeTab === 'All' || pair.category === activeTab;
      const matchesSearch = pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || pair.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div style={{ background: theme.colors.bgPrimary, minHeight: 'calc(100vh - 64px)', color: '#fff', padding: '40px 24px', fontFamily: theme.font.family }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: theme.colors.textPrimary }}>Markets Overview</h1>
          <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: 0 }}>Real-time prices, volume, and top movers across popular futures crypto pairs.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <HighlightCard symbol="BTCUSDT" icon={<Flame size={16} />} label="Hot Pair" iconColor={theme.colors.accent} pairLabel="BTC/USDT" name="Bitcoin" />
          <HighlightCard symbol="LINKUSDT" icon={<TrendingUp size={16} />} label="Top Gainer" iconColor={theme.colors.positive} pairLabel="LINK/USDT" name="Chainlink" />
          <HighlightCard symbol="SOLUSDT" icon={<Sparkles size={16} />} label="New Listing" iconColor={theme.colors.accent} pairLabel="SOL/USDT" name="Solana" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', background: theme.colors.bgCard, padding: '4px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            {['All', 'Hot', 'Altcoins', 'Meme'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ background: activeTab === tab ? theme.colors.bgInput : 'transparent', color: activeTab === tab ? theme.colors.accent : theme.colors.textSecondary, border: 'none', padding: '8px 16px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Coin / Pair..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', background: theme.colors.bgCard, border: `1px solid ${theme.colors.border}`, color: '#fff', borderRadius: theme.radius.md, fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ background: theme.colors.bgCard, borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}`, fontSize: '13px' }}>
                <th style={{ padding: '16px 24px' }}>Trading Pair</th>
                <th>Last Price</th>
                <th>24h Change</th>
                <th>24h High</th>
                <th>24h Volume</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.map((pair) => (
                <PairRow key={pair.symbol} pair={pair} navigate={navigate} />
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};