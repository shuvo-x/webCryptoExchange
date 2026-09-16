import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import { calculateLiquidationPrice } from '../utils/pnl';

export const OrderForm = ({ currentPrice, balances, onOpenOrder, onPlaceLimitOrder }) => {
  const [orderMode, setOrderMode] = useState('MARKET');
  const [side, setSide] = useState('BUY');
  const [leverage, setLeverage] = useState(20);
  const [margin, setMargin] = useState(2);
  const [targetPrice, setTargetPrice] = useState('');

  const totalAvail = balances ? balances.futures : 0;
  const positionSize = margin * leverage;
  const isHighLeverage = leverage >= 50;

  const handleMax = () => setMargin(Number(totalAvail.toFixed(2)));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (margin > totalAvail) {
      alert('Insufficient Futures balance! (Spot থেকে Transfer করুন)'); // এই একটাই জায়গায় critical validation, toast না হওয়ায় সাময়িক alert - পরবর্তী ধাপে inline error-এ বদলানো যাবে
      return;
    }

    const type = side === 'BUY' ? 'LONG' : 'SHORT';

    if (orderMode === 'MARKET') {
      const liquidationPrice = calculateLiquidationPrice(currentPrice, leverage, type);
      onOpenOrder({ type, leverage, margin, entryPrice: currentPrice, liquidationPrice });
    } else {
      const price = Number(targetPrice);
      if (!price || price <= 0) {
        alert('সঠিক target price দিন।');
        return;
      }
      onPlaceLimitOrder({ type, leverage, margin, targetPrice: price });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ color: '#fff', fontSize: '13px' }}>

      <div style={{ display: 'flex', marginBottom: '12px', gap: '8px' }}>
        <button type="button" onClick={() => setOrderMode('MARKET')} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', background: orderMode === 'MARKET' ? '#f0b90b' : '#181a20', color: orderMode === 'MARKET' ? '#000' : '#848e9c' }}>
          Market
        </button>
        <button type="button" onClick={() => setOrderMode('LIMIT')} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', background: orderMode === 'LIMIT' ? '#f0b90b' : '#181a20', color: orderMode === 'LIMIT' ? '#000' : '#848e9c' }}>
          Limit
        </button>
      </div>

      <div style={{ display: 'flex', marginBottom: '16px', background: '#181a20', borderRadius: '4px', padding: '4px' }}>
        <button type="button" onClick={() => setSide('BUY')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: side === 'BUY' ? '#0ecb81' : 'transparent', color: side === 'BUY' ? '#000' : '#848e9c' }}>
          Buy / Long
        </button>
        <button type="button" onClick={() => setSide('SELL')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: side === 'SELL' ? '#f6465d' : 'transparent', color: side === 'SELL' ? '#fff' : '#848e9c' }}>
          Sell / Short
        </button>
      </div>

      {orderMode === 'LIMIT' && (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>Target Price (USDT)</label>
          <input
            type="number" min="0" step="0.0001" required
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder={currentPrice ? currentPrice.toFixed(2) : ''}
            style={{ width: '100%', padding: '8px', background: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>Futures Balance</label>
        <div style={{ fontWeight: 'bold' }}>{totalAvail.toFixed(2)} USDT</div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>Leverage: {leverage}x</label>
        <input type="range" min="1" max="100" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      {isHighLeverage && (
        <div style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid #f0b90b', borderRadius: '4px', padding: '8px 10px', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: '#f0b90b' }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} /> High leverage বাড়ায় liquidation-এর ঝুঁকি
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>Margin (USDT)</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="number" min="1" step="0.1" value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            style={{ flex: 1, padding: '8px', background: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
          <button type="button" onClick={handleMax} style={{ background: '#2b313a', border: 'none', color: '#f0b90b', padding: '0 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            Max
          </button>
        </div>
      </div>

      {/* Position preview */}
      <div style={{ background: '#181a20', borderRadius: '4px', padding: '10px', marginBottom: '16px', fontSize: '11px', color: '#848e9c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Position Size</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{positionSize.toFixed(2)} USDT</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Available Balance</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{totalAvail.toFixed(2)} USDT</span>
        </div>
      </div>

      <button type="submit" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', background: side === 'BUY' ? '#0ecb81' : '#f6465d', color: side === 'BUY' ? '#000' : '#fff' }}>
        {orderMode === 'MARKET' ? (side === 'BUY' ? 'Open Long (Market)' : 'Open Short (Market)') : (side === 'BUY' ? 'Place Buy Limit' : 'Place Sell Limit')}
      </button>
    </form>
  );
};

OrderForm.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  balances: PropTypes.shape({ spot: PropTypes.number, futures: PropTypes.number }),
  onOpenOrder: PropTypes.func.isRequired,
  onPlaceLimitOrder: PropTypes.func.isRequired,
};