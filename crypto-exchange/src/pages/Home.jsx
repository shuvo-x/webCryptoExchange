import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Zap, TrendingUp, DollarSign, Smartphone, ArrowRight, Bell } from 'lucide-react';
import { useMarketStore } from '../store/marketStore';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { PAIRS, FEATURED_SYMBOLS } from '../data/pairs';
import { formatPrice, formatPercent, formatVolume } from '../utils/format';
import { theme } from '../theme';

const TickerCard = ({ symbol, navigate }) => {
  const live = useMarketStore((s) => s.prices[symbol]);
  const isPositive = live.change >= 0;

  return (
    <div
      onClick={() => navigate(`/trade/${symbol}`)}
      style={{ background: theme.colors.bgCard, padding: '16px', borderRadius: theme.radius.xl, border: `1px solid ${theme.colors.border}`, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.colors.accent; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.colors.border; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{symbol}</span>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative, background: isPositive ? theme.colors.positiveBg : theme.colors.negativeBg, padding: '2px 6px', borderRadius: theme.radius.sm }}>
          {formatPercent(live.change)}
        </span>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: isPositive ? theme.colors.positive : theme.colors.negative }}>
        {formatPrice(live.price)}
      </div>
      <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginTop: '4px' }}>Vol: {formatVolume(live.volume)}</div>
    </div>
  );
};

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
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('hot');
  const prices = useMarketStore((s) => s.prices);

  const bonusCtaTarget = user ? '/wallet' : '/signup';
  const bonusCtaLabel = user ? 'Go to Wallet' : 'Claim $10 Bonus';

  const featured = FEATURED_SYMBOLS.map((symbol) => ({
    symbol,
    name: PAIRS.find((p) => p.symbol === symbol).name,
  }));

  const marketList =
    activeTab === 'gainers'
      ? [...PAIRS].sort((a, b) => prices[b.symbol].change - prices[a.symbol].change)
      : PAIRS;

  return (
    <div style={{ background: theme.colors.bgSecondary, color: '#fff', fontFamily: theme.font.family, minHeight: '100vh', overflowX: 'hidden' }}>

      <div style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}`, padding: isMobile ? '10px 16px' : '10px 24px', fontSize: isMobile ? '12px' : '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: theme.colors.textSecondary, flexWrap: 'wrap', textAlign: 'center' }}>
        <Bell size={14} color={theme.colors.accent} style={{ flexShrink: 0 }} />
        <span>{isMobile ? 'Register & get 10 USDT Trial!' : <>Register today and receive <strong>10 USDT Trial Balance</strong> automatically!</>}</span>
        <Link to={bonusCtaTarget} style={{ color: theme.colors.accent, textDecoration: 'none', fontWeight: 'bold' }}>
          {user ? 'View Wallet' : 'Claim Now'} &gt;
        </Link>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '40px 16px 32px' : '80px 24px 60px', display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '1.2fr 0.8fr', gap: isMobile ? '32px' : '40px', alignItems: 'center' }}>
        <div>
          <span style={{ background: theme.colors.accentBg, color: theme.colors.accent, padding: '6px 12px', borderRadius: '20px', fontSize: isMobile ? '11px' : '13px', fontWeight: 'bold' }}>
            ⚡ Leading Crypto Derivatives Exchange
          </span>
          <h1 style={{ fontSize: isMobile ? '32px' : '56px', fontWeight: '800', margin: '16px 0 14px', lineHeight: '1.15', color: theme.colors.textPrimary }}>
            Trade Crypto with <br /><span style={{ color: theme.colors.accent }}>100x Leverage</span>
          </h1>
          <p style={{ fontSize: isMobile ? '14px' : '18px', color: theme.colors.textSecondary, marginBottom: '28px', lineHeight: '1.6' }}>
            Experience ultra-low latency trading, deep liquidity, and maximum security. Start trading futures in minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to={bonusCtaTarget} style={{ background: theme.colors.accent, color: '#000', padding: isMobile ? '12px 22px' : '14px 32px', borderRadius: theme.radius.sm, textDecoration: 'none', fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {bonusCtaLabel} <ArrowRight size={16} />
            </Link>
            <Link to="/trade/BTCUSDT" style={{ background: theme.colors.bgInput, color: '#fff', padding: isMobile ? '12px 22px' : '14px 32px', borderRadius: theme.radius.sm, textDecoration: 'none', fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>
              Start Trading
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
          {featured.map((item) => (
            <TickerCard key={item.symbol} symbol={item.symbol} navigate={navigate} />
          ))}
        </div>
      </div>

      <div style={{ background: theme.colors.bgPrimary, padding: isMobile ? '32px 16px' : '60px 24px', borderTop: `1px solid ${theme.colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: isMobile ? '20px' : '28px', margin: 0 }}>Market Trend</h2>
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
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
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '40px 16px' : '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: isMobile ? '22px' : '32px', marginBottom: '10px' }}>Why Trade on NEXTEX?</h2>
        <p style={{ color: theme.colors.textSecondary, marginBottom: '32px', fontSize: isMobile ? '13px' : '15px' }}>Designed for traders of all levels with industry-leading performance.</p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '24px' }}>
          <div style={{ background: theme.colors.bgCard, padding: isMobile ? '20px 14px' : '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <Zap size={isMobile ? 26 : 36} color={theme.colors.accent} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: isMobile ? '14px' : '18px', marginBottom: '6px' }}>Ultra High Speed</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: isMobile ? '11px' : '13px', lineHeight: '1.5' }}>Matching engine capable of processing 100,000+ transactions per second.</p>
          </div>
          <div style={{ background: theme.colors.bgCard, padding: isMobile ? '20px 14px' : '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <Shield size={isMobile ? 26 : 36} color={theme.colors.positive} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: isMobile ? '14px' : '18px', marginBottom: '6px' }}>Bank-Grade Security</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: isMobile ? '11px' : '13px', lineHeight: '1.5' }}>Multi-layer protection with cold storage for user funds.</p>
          </div>
          <div style={{ background: theme.colors.bgCard, padding: isMobile ? '20px 14px' : '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <TrendingUp size={isMobile ? 26 : 36} color={theme.colors.accent} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: isMobile ? '14px' : '18px', marginBottom: '6px' }}>Up to 100x Leverage</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: isMobile ? '11px' : '13px', lineHeight: '1.5' }}>Maximize your profits with flexible leverage options on all major pairs.</p>
          </div>
          <div style={{ background: theme.colors.bgCard, padding: isMobile ? '20px 14px' : '32px 20px', borderRadius: theme.radius.lg, border: `1px solid ${theme.colors.border}` }}>
            <DollarSign size={isMobile ? 26 : 36} color={theme.colors.positive} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: isMobile ? '14px' : '18px', marginBottom: '6px' }}>Instant Withdrawals</h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: isMobile ? '11px' : '13px', lineHeight: '1.5' }}>Withdraw your profits via TRC20 smoothly without hidden delays.</p>
          </div>
        </div>
      </div>

      <div style={{ background: theme.colors.bgCard, borderTop: `1px solid ${theme.colors.border}`, padding: isMobile ? '32px 16px' : '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '20px' : '32px', marginBottom: '10px' }}>Trade Anywhere, Anytime</h2>
            <p style={{ color: theme.colors.textSecondary, fontSize: isMobile ? '13px' : '16px', maxWidth: '500px' }}>
              Download the NEXTEX mobile app to monitor positions, receive alerts, and trade on the go.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.textSecondary}`, padding: isMobile ? '10px 16px' : '12px 24px', borderRadius: theme.radius.md, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '12px' : '14px' }}>
              <Smartphone size={18} /> App Store
            </button>
            <button style={{ background: theme.colors.bgInput, color: '#fff', border: `1px solid ${theme.colors.textSecondary}`, padding: isMobile ? '10px 16px' : '12px 24px', borderRadius: theme.radius.md, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '12px' : '14px' }}>
              <Smartphone size={18} /> Google Play
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};