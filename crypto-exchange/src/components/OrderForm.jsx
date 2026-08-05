import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { calculateLiquidationPrice } from '../utils/pnl';

export const OrderForm = ({ currentPrice, balances, onOpenOrder }) => {
  const [side, setSide] = useState('BUY');
  const [leverage, setLeverage] = useState(20);
  const [margin, setMargin] = useState(2);

  const totalAvail = balances ? balances.trial + balances.deposit + balances.profit : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (margin > totalAvail) {
      alert('Insufficient available balance!');
      return;
    }
    if (onOpenOrder) {
      const type = side === 'BUY' ? 'LONG' : 'SHORT';
      const liquidationPrice = calculateLiquidationPrice(currentPrice, leverage, type);
      onOpenOrder({ id: Date.now(), type, leverage, margin, entryPrice: currentPrice, liquidationPrice });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ color: '#fff', fontSize: '13px' }}>
      <div style={{ display: 'flex', marginBottom: '16px', background: '#181a20', borderRadius: '4px', padding: '4px' }}>
        <button type="button" onClick={() => setSide('BUY')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: side === 'BUY' ? '#0ecb81' : 'transparent', color: side === 'BUY' ? '#000' : '#848e9c' }}>
          Buy / Long
        </button>
        <button type="button" onClick={() => setSide('SELL')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: side === 'SELL' ? '#f6465d' : 'transparent', color: side === 'SELL' ? '#fff' : '#848e9c' }}>
          Sell / Short
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>Available Balance</label>
        <div style={{ fontWeight: 'bold' }}>{totalAvail.toFixed(2)} USDT</div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>Leverage: {leverage}x</label>
        <input type="range" min="1" max="100" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>Margin (USDT)</label>
        <input type="number" min="1" step="0.1" value={margin} onChange={(e) => setMargin(Number(e.target.value))} style={{ width: '100%', padding: '8px', background: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
      </div>

      <button type="submit" style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', background: side === 'BUY' ? '#0ecb81' : '#f6465d', color: side === 'BUY' ? '#000' : '#fff' }}>
        {side === 'BUY' ? 'Open Long' : 'Open Short'}
      </button>
    </form>
  );
};

OrderForm.propTypes = {
  currentPrice: PropTypes.number.isRequired,
  balances: PropTypes.shape({ trial: PropTypes.number, deposit: PropTypes.number, profit: PropTypes.number }),
  onOpenOrder: PropTypes.func,
};