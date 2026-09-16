import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

export const OrderConfirmModal = ({ order, onConfirm, onCancel, isSubmitting }) => {
  if (!order) return null;

  const isMarket = order.mode === 'MARKET';
  const referencePrice = isMarket ? order.entryPrice : order.targetPrice;
  const positionSize = order.margin * order.leverage;
  const liquidationPrice = isMarket
    ? order.liquidationPrice
    : order.type === 'LONG'
    ? referencePrice - referencePrice / order.leverage
    : referencePrice + referencePrice / order.leverage;

  const isHighLeverage = order.leverage >= 50;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e2329', padding: '24px', borderRadius: '8px', color: '#fff', width: '380px' }}>
        <h3 style={{ marginTop: 0 }}>
          Confirm {order.type === 'LONG' ? 'Long' : 'Short'} — {order.symbol}
        </h3>

        <div style={{ background: '#181a20', borderRadius: '6px', padding: '14px', fontSize: '13px', marginBottom: '14px' }}>
          <Row label="Order Type" value={isMarket ? 'Market' : 'Limit'} />
          <Row label={isMarket ? 'Entry Price' : 'Target Price'} value={`$${referencePrice.toFixed(2)}`} />
          <Row label="Margin" value={`${order.margin.toFixed(2)} USDT`} />
          <Row label="Leverage" value={`${order.leverage}x`} />
          <Row label="Position Size" value={`${positionSize.toFixed(2)} USDT`} />
          <Row label="Est. Liquidation Price" value={`$${liquidationPrice.toFixed(2)}`} valueColor="#f6465d" last />
        </div>

        {isHighLeverage && (
          <div style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid #f0b90b', borderRadius: '6px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '14px' }}>
            <AlertTriangle size={16} color="#f0b90b" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '12px', color: '#f0b90b' }}>
              High leverage ({order.leverage}x) ব্যবহার করলে liquidation-এর ঝুঁকি বাড়ে। ছোট price move-এই পুরো margin হারাতে পারেন।
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ flex: 1, padding: '10px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{ flex: 1, padding: '10px', background: order.type === 'LONG' ? '#0ecb81' : '#f6465d', color: order.type === 'LONG' ? '#000' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', opacity: isSubmitting ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, valueColor, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: last ? 'none' : '1px solid #2b313a' }}>
    <span style={{ color: '#848e9c' }}>{label}</span>
    <span style={{ fontWeight: 'bold', color: valueColor || '#fff' }}>{value}</span>
  </div>
);

OrderConfirmModal.propTypes = {
  order: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};