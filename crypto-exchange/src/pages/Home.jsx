import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, TrendingUp, DollarSign, Smartphone, ArrowRight, Bell } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { PAIRS, FEATURED_SYMBOLS } from '../data/pairs';
import { formatPrice, formatPercent, formatVolume } from '../utils/format';
import { theme } from '../theme';

// প্রতিটা card নিজের symbol-এই subscribe করে - শুধু ওই symbol-এর price বদলালেই
// এই card re-render হবে, বাকি card গুলো অক্ষত থাকবে
const TickerCard = ({ symbol, navigate }) => {
  const live = useMarketStore((s) => s.prices[symbol]);
  const isPositive = live.change >= 0;

  return (
    <div
      onClick={() => navigate(`/trade/${symbol}`)}
      style={{ background: theme.colors.bgCard, padding: '20px', borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border}`, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.colors.accent; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.colors.border; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{symbol}</span>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative, background: isPositive ? theme.colors.positiveBg : theme.colors.negativeBg, padding: '2px 6px', borderRadius: theme.radius.sm }}>
          {formatPercent(live.change)}
        </span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative }}>
        {formatPrice(live.price)}
      </div>
      <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '6px' }}>Vol: {formatVolume(live.volume)}</div>
    </div>
  );
};

// টেবিলের প্রতিটা row নিজের symbol-এই subscribe করে - same re-render optimization
const MarketRow = ({ symbol, name, navigate }) => {
  const live = useMarketStore((s) => s.prices[symbol]);
  const isPositive = live.change >= 0;

  return (
    <tr style={{ borderBottom: `1px solid ${theme.colors.border}`, fontSize: '14px' }}>
      <td style={{ padding: '16px 24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{symbol}</span>
        <span style={{ fontSize: '11px', color: theme.colors.textSecondary }}>{name}</span>
      </td>
      <td style={{ fontWeight: 'bold' }}>{formatPrice(live.price)}</td>
      <td style={{ color: isPositive ? theme.colors.positive : theme.colors.negative, fontWeight: 'bold' }}>{formatPercent(live.change)}</td>
      <td style={{ color: theme.colors.textSecondary, fontSize: '13px' }}>{formatPrice(live.high)} / {formatPrice(live.low)}</td>
      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
        <button onClick={() => navigate(`/trade/${symbol}`)} style={{ background: theme.colors.bgInput, border: 'none', color: '#fff', padding: '6px 16px', borderRadius: theme.radius.sm, cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
          Trade
        </button>
      </td>
    </tr>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hot');
  const prices = useMarketStore((s) => s.prices);

  const featured = FEATURED_SYMBOLS.map((symbol) => ({
    symbol,
    name: PAIRS.find((p) => p.symbol === symbol).name,
  }));

  const marketList =
    activeTab === 'gainers'
      ? [...PAIRS].sort((a, b) => prices[b.symbol].change - prices[a.symbol].change)
      : PAIRS;

  return (
    <div style={{ background: theme.colors.bgSecondary, color: '#fff', fontFamily: theme.font.family, minHeight: '100vh' }}>

      <div style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}`, padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: theme.colors.textSecondary }}>
        <Bell size={14} color={theme.colors.accent} />
        <span>New User Special: Register today and receive <strong>10 USDT Trial Balance</strong> automatically!</span>
        <Link to="/signup" style={{ color: theme.colors.accent, textDecoration: 'none', fontWeight: 'bold', marginLeft: '6px' }}>Claim Now &gt;</Link>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 60px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
        <div>
          <span style={{ background: theme.colors.accentBg, color: theme.colors.accent, padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            ⚡ Leading Crypto Derivatives Exchange
          </span>
          <h1 style={{ fontSize: '56px', fontWeight: '800', margin: '20px 0 16px', lineHeight: '1.15', color: theme.colors.textPrimary }}>
            Trade Crypto with <br /><span style={{ color: theme.colors.accent }}>100x Leverage</span>
          </h1>
          <p style={{ fontSize: '18px', color: theme.colors.textSecondary, marginBottom: '32px', lineHeight: '1.6' }}>
            Experience ultra-low latency trading, deep liquidity, and maximum security. Start trading futures in minutes.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/signup" style={{ background: theme.colors.accent, color: '#000', padding: '14px 32px', borderRadius: theme.radius.sm, textDecoration: 'none', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Claim $10 Bonus <ArrowRight size={18} />
            </Link>
            <Link to="/trade/BTCUSDT" style={{ background: theme.colors.bgInput, color: '#fff', padding: '14px 32px', borderRadius: theme.radius.sm, textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
              Start Trading
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {featured.map((item) => (
            <TickerCard key={item.symbol} symbol={item.symbol} navigate={navigate} />
          ))}
        </div>
      </div>

      <div style={{ background: theme.colors.bgPrimary, padding: '60px 24px', borderTop: `1px solid ${theme.colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', margin: 0 }}>Market Trend</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['hot', 'gainers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ background: activeTab === tab ? theme.colors.bgInput : 'transparent', color: activeTab === tab ? theme.colors.accent : theme.colors.textSecondary, border: `1px solid ${theme.colors.border}`, padding: '8px 16px', borderRadius: theme.radius.md, fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: theme.colors.bgSecondary, borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: theme.colors.textSecondary, borderBottom: `1px solid ${theme.colors.border}`, fontSize: '13px' }}>
                  <th style={{ padding: '16px 24px' }}>Pair</th>
                  <th>Last Price</th>
                  <th>24h Change</th>
                  <th>24h High/Low</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {marketList.map((pair) => (
                  <MarketRow key={pair.symbol} symbol={pair.symbol} name={pair.name} navigate={navigate} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>Why Trade on NEXTEX?</h2>
        <p style={{ color: theme.colors.textSecondary, marginBottom: '48px' }}>Designed for traders of all levels with industry-leading performance.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div style={{ background: theme.colors.bgCard, padding: '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <Zap size={36} color={theme.colors.accent} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Ultra High Speed</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: '13px', lineHeight: '1.5' }}>Matching engine capable of processing 100,000+ transactions per second.</p>
          </div>
          <div style={{ background: theme.colors.bgCard, padding: '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <Shield size={36} color={theme.colors.positive} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Bank-Grade Security</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: '13px', lineHeight: '1.5' }}>Multi-layer protection with cold storage for user funds.</p>
          </div>
          <div style={{ background: theme.colors.bgCard, padding: '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <TrendingUp size={36} color={theme.colors.accent} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Up to 100x Leverage</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: '13px', lineHeight: '1.5' }}>Maximize your profits with flexible leverage options on all major pairs.</p>
          </div>
          <div style={{ background: theme.colors.bgCard, padding: '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <DollarSign size={36} color={theme.colors.positive} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Instant Withdrawals</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: '13px', lineHeight: '1.5' }}>Withdraw your profits via TRC20 smoothly without hidden delays.</p>
          </div>
        </div>
      </div>

      <div style={{ background: theme.colors.bgCard, borderTop: `1px solid ${theme.colors.border}`, padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>Trade Anywhere, Anytime</h2>
            <p style={{ color: theme.colors.textSecondary, fontSize: '16px', maxWidth: '500px' }}>
              Download the NEXTEX mobile app to monitor positions, receive alerts, and trade on the go.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.textSecondary}`, padding: '12px 24px', borderRadius: theme.radius.md, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={20} /> App Store
            </button>
            <button style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.textSecondary}`, padding: '12px 24px', borderRadius: theme.radius.md, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={20} /> Google Play
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};