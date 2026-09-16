import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const SpotOrderForm = ({ currentPrice, spotBalance, holdingQuantity, coinSymbol, onBuy, onSell, isSubmitting }) => {
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');

  const isBuy = side === 'BUY';
  const maxValue = isBuy ? spotBalance : holdingQuantity;

  const handleSideChange = (newSide) => {
    setSide(newSide);
    setAmount('');
  };

  const handleMax = () => setAmount(String(maxValue));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return;

    if (val > maxValue) {
      alert(isBuy ? 'Insufficient Spot balance' : `Insufficient ${coinSymbol} balance`);
      return;
    }

    if (isBuy) {
      await onBuy(val);
    } else {
      await onSell(val);
    }
    setAmount('');
  };

  const estimated = currentPrice
    ? isBuy
      ? Number(amount || 0) / currentPrice
      : Number(amount || 0) * currentPrice
    : 0;

  return (
    <form onSubmit={handleSubmit} style={{ color: '#fff', fontSize: '13px' }}>
      <div style={{ display: 'flex', marginBottom: '16px', background: '#181a20', borderRadius: '4px', padding: '4px' }}>
        <button
          type="button"
          onClick={() => handleSideChange('BUY')}
          style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: side === 'BUY' ? '#0ecb81' : 'transparent', color: side === 'BUY' ? '#000' : '#848e9c' }}
        >
          Buy {coinSymbol}
        </button>
        <button
          type="button"
          onClick={() => handleSideChange('SELL')}
          style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', background: side === 'SELL' ? '#f6465d' : 'transparent', color: side === 'SELL' ? '#fff' : '#848e9c' }}
        >
          Sell {coinSymbol}
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>
          {isBuy ? 'Spot Balance' : `${coinSymbol} Balance`}
        </label>
        <div style={{ fontWeight: 'bold' }}>
          {maxValue.toFixed(isBuy ? 2 : 6)} {isBuy ? 'USDT' : coinSymbol}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#848e9c', display: 'block', marginBottom: '4px' }}>
          {isBuy ? 'Amount to spend (USDT)' : `Amount to sell (${coinSymbol})`}
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="number" min="0" step="any" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ flex: 1, padding: '8px', background: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
          />
          <button type="button" onClick={handleMax} style={{ background: '#2b313a', border: 'none', color: '#f0b90b', padding: '0 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            Max
          </button>
        </div>
      </div>

      <div style={{ background: '#181a20', borderRadius: '4px', padding: '10px', marginBottom: '16px', fontSize: '11px', color: '#848e9c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>You will {isBuy ? 'receive' : 'get'}</span>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>
            {isBuy ? `≈ ${estimated.toFixed(6)} ${coinSymbol}` : `≈ ${estimated.toFixed(2)} USDT`}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: isSubmitting ? 'not-allowed' : 'pointer', background: isBuy ? '#0ecb81' : '#f6465d', color: isBuy ? '#000' : '#fff', opacity: isSubmitting ? 0.6 : 1 }}
      >
        {isSubmitting ? 'Processing...' : isBuy ? `Buy ${coinSymbol}` : `Sell ${coinSymbol}`}
      </button>
    </form>
  );
};

SpotOrderForm.propTypes = {
  currentPrice: PropTypes.number,
  spotBalance: PropTypes.number.isRequired,
  holdingQuantity: PropTypes.number.isRequired,
  coinSymbol: PropTypes.string.isRequired,
  onBuy: PropTypes.func.isRequired,
  onSell: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};