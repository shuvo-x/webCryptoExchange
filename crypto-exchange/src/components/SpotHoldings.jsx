import React from 'react';
import PropTypes from 'prop-types';
import { useMarketStore } from '../store/marketStore';

export const SpotHoldings = React.memo(({ holdings }) => {
  const prices = useMarketStore((s) => s.prices);

  const nonZero = holdings.filter((h) => Number(h.quantity) > 0.000001);

  return (
    <div style={{ background: '#1e222d', padding: '20px', borderRadius: '8px', color: '#fff', marginTop: '20px' }}>
      <h3>My Spot Holdings</h3>
      {nonZero.length === 0 ? (
        <p style={{ color: '#888' }}>কোনো coin হোল্ডিং নেই</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '500px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', borderBottom: '1px solid #2a2e39' }}>
                <th>Coin</th><th>Quantity</th><th>Price</th><th>Value (USDT)</th>
              </tr>
            </thead>
            <tbody>
              {nonZero.map((h) => {
                const pairSymbol = `${h.coin_symbol}USDT`;
                const price = prices[pairSymbol]?.price ?? 0;
                const value = Number(h.quantity) * price;
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid #2a2e39' }}>
                    <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{h.coin_symbol}</td>
                    <td>{Number(h.quantity).toFixed(6)}</td>
                    <td>{price ? `$${price.toFixed(2)}` : '...'}</td>
                    <td style={{ fontWeight: 'bold' }}>${value.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

SpotHoldings.displayName = 'SpotHoldings';
SpotHoldings.propTypes = {
  holdings: PropTypes.array.isRequired,
};