import React from 'react';
import PropTypes from 'prop-types';

export const OrderBook = React.memo(({ currentPrice }) => {
  const generateAsks = () => Array.from({ length: 6 }, (_, i) => ({ price: (currentPrice + (6 - i) * 1.5).toFixed(2), amount: (Math.random() * 0.8 + 0.1).toFixed(3) }));
  const generateBids = () => Array.from({ length: 6 }, (_, i) => ({ price: (currentPrice - (i + 1) * 1.5).toFixed(2), amount: (Math.random() * 0.8 + 0.1).toFixed(3) }));

  return (
    <div style={{ background: '#1e2329', padding: '16px', borderRadius: '8px', color: '#fff', fontSize: '12px' }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#eaecef' }}>Order Book</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {generateAsks().map((ask, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#f6465d' }}>
            <span>{ask.price}</span><span style={{ color: '#848e9c' }}>{ask.amount}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 0', margin: '8px 0', borderTop: '1px solid #2b313a', borderBottom: '1px solid #2b313a', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: '#0ecb81' }}>
        ${currentPrice ? currentPrice.toFixed(2) : '---'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {generateBids().map((bid, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#0ecb81' }}>
            <span>{bid.price}</span><span style={{ color: '#848e9c' }}>{bid.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

OrderBook.displayName = 'OrderBook';
OrderBook.propTypes = { currentPrice: PropTypes.number };