import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMarketStore } from '../store/marketStore';
import { calculatePnL } from '../utils/pnl';

const PositionRow = ({ pos, onClose, closingIds }) => {
  const live = useMarketStore((s) => s.prices[pos.symbol]);
  const currentPrice = live?.price;
  const pnl = calculatePnL(pos, currentPrice);
  const isPositive = pnl >= 0;
  const isThisClosing = closingIds.has(pos.id);

  return (
    <tr style={{ borderBottom: '1px solid #2a2e39' }}>
      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{pos.symbol}</td>
      <td style={{ color: pos.type === 'LONG' ? '#26a69a' : '#ef5350' }}>{pos.type}</td>
      <td>{pos.leverage}x</td>
      <td>{Number(pos.margin).toFixed(2)} USDT</td>
      <td>${Number(pos.entry_price).toFixed(2)}</td>
      <td style={{ color: currentPrice ? (isPositive ? '#26a69a' : '#ef5350') : '#848e9c', fontWeight: 'bold' }}>
        {currentPrice ? `$${currentPrice.toFixed(2)}` : '...'}
      </td>
      <td style={{ color: '#ef5350' }}>${Number(pos.liquidation_price).toFixed(2)}</td>
      <td style={{ color: isPositive ? '#26a69a' : '#ef5350', fontWeight: 'bold' }}>
        {currentPrice ? (isPositive ? `+${pnl.toFixed(2)}` : pnl.toFixed(2)) : '...'}
      </td>
      <td>
        <button
          onClick={() => onClose(pos.id, currentPrice)}
          disabled={!currentPrice || isThisClosing}
          style={{ background: '#ef5350', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: currentPrice && !isThisClosing ? 'pointer' : 'not-allowed', opacity: isThisClosing ? 0.5 : 1 }}
        >
          {isThisClosing ? 'Closing...' : 'Close'}
        </button>
      </td>
    </tr>
  );
};

export const ActivePositions = React.memo(({ positions, onClosePosition }) => {
  const [closingIds, setClosingIds] = useState(new Set());

  const handleClose = async (positionId, currentPrice) => {
    if (closingIds.has(positionId)) return;
    setClosingIds((prev) => new Set(prev).add(positionId));
    try {
      await onClosePosition(positionId, currentPrice);
    } finally {
      setClosingIds((prev) => {
        const next = new Set(prev);
        next.delete(positionId);
        return next;
      });
    }
  };

  return (
    <div style={{ background: '#1e222d', padding: '20px', borderRadius: '8px', color: '#fff', marginTop: '20px' }}>
      <h3>Active Positions</h3>
      {positions.length === 0 ? (
        <p style={{ color: '#888' }}>কোনো রানিং ট্রেড নেই</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', borderBottom: '1px solid #2a2e39' }}>
                <th>Symbol</th><th>Type</th><th>Leverage</th><th>Margin</th><th>Entry</th><th>Mark Price</th><th>Liq Price</th><th>PnL (USDT)</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <PositionRow key={pos.id} pos={pos} onClose={handleClose} closingIds={closingIds} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

ActivePositions.displayName = 'ActivePositions';
ActivePositions.propTypes = {
  positions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['LONG', 'SHORT']).isRequired,
      leverage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      margin: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      entry_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      liquidation_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ).isRequired,
  onClosePosition: PropTypes.func.isRequired,
};