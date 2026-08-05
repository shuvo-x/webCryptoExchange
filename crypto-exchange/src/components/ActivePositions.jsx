import React from 'react';
import PropTypes from 'prop-types';
import { calculatePnL } from '../utils/pnl';

export const ActivePositions = React.memo(({ positions, currentPrice, onClosePosition }) => {
  return (
    <div style={{ background: '#1e222d', padding: '20px', borderRadius: '8px', color: '#fff', marginTop: '20px' }}>
      <h3>Active Positions</h3>
      {positions.length === 0 ? (
        <p style={{ color: '#888' }}>কোনো রানিং ট্রেড নেই</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#888', borderBottom: '1px solid #2a2e39' }}>
              <th>Type</th><th>Leverage</th><th>Margin</th><th>Entry Price</th><th>Liq Price</th><th>PnL (USDT)</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const pnl = calculatePnL(pos, currentPrice);
              return (
                <tr key={pos.id} style={{ borderBottom: '1px solid #2a2e39' }}>
                  <td style={{ color: pos.type === 'LONG' ? '#26a69a' : '#ef5350' }}>{pos.type}</td>
                  <td>{pos.leverage}x</td>
                  <td>{pos.margin} USDT</td>
                  <td>${pos.entryPrice}</td>
                  <td style={{ color: '#ef5350' }}>${pos.liquidationPrice.toFixed(2)}</td>
                  <td style={{ color: pnl >= 0 ? '#26a69a' : '#ef5350', fontWeight: 'bold' }}>{pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2)}</td>
                  <td>
                    <button onClick={() => onClosePosition(pos.id, pnl)} style={{ background: '#ef5350', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Close</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
});

ActivePositions.displayName = 'ActivePositions';
ActivePositions.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['LONG', 'SHORT']).isRequired,
    status: PropTypes.oneOf(['OPEN', 'LIQUIDATED']),
    leverage: PropTypes.number.isRequired,
    margin: PropTypes.number.isRequired,
    entryPrice: PropTypes.number.isRequired,
    liquidationPrice: PropTypes.number.isRequired,
  })).isRequired,
  currentPrice: PropTypes.number,
  onClosePosition: PropTypes.func.isRequired,
};