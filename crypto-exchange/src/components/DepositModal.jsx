import React from 'react';
import PropTypes from 'prop-types';

export const DepositModal = React.memo(({ isOpen, onClose, onDeposit }) => {
  if (!isOpen) return null;

  const handleSimulateDeposit = () => {
    onDeposit(50);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e2329', padding: '24px', borderRadius: '8px', color: '#fff', width: '360px' }}>
        <h3 style={{ marginTop: 0 }}>Deposit USDT</h3>
        <p style={{ fontSize: '13px', color: '#848e9c' }}>Send TRC20 USDT to the address below:</p>
        <div style={{ background: '#181a20', padding: '12px', borderRadius: '4px', wordBreak: 'break-all', fontSize: '12px', color: '#0ecb81', marginBottom: '20px', textAlign: 'center' }}>
          TXYZ982749812739182379128371982
        </div>
        <button onClick={handleSimulateDeposit} style={{ width: '100%', padding: '10px', background: '#0ecb81', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>
          Simulate +$50 USDT Deposit
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '8px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
});

DepositModal.displayName = 'DepositModal';
DepositModal.propTypes = { isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, onDeposit: PropTypes.func.isRequired };