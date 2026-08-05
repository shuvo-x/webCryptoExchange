import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const WithdrawModal = React.memo(({ isOpen, onClose, profitBalance, onRequestWithdraw }) => {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(amount) > profitBalance) {
      alert('Amount exceeds withdrawable profit balance!');
      return;
    }
    onRequestWithdraw(Number(amount));
    alert('Withdrawal request submitted for review!');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e2329', padding: '24px', borderRadius: '8px', color: '#fff', width: '360px' }}>
        <h3 style={{ marginTop: 0 }}>Withdraw Profit</h3>
        <p style={{ fontSize: '12px', color: '#848e9c' }}>Withdrawable Balance: <strong style={{ color: '#0ecb81' }}>${profitBalance.toFixed(2)} USDT</strong></p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#848e9c' }}>TRC20 Wallet Address</label>
            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '8px', background: '#2b313a', border: 'none', color: '#fff', borderRadius: '4px', marginTop: '4px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: '#848e9c' }}>Amount (USDT)</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '8px', background: '#2b313a', border: 'none', color: '#fff', borderRadius: '4px', marginTop: '4px', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#f0b90b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>Submit Withdrawal</button>
          <button type="button" onClick={onClose} style={{ width: '100%', padding: '8px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
        </form>
      </div>
    </div>
  );
});

WithdrawModal.displayName = 'WithdrawModal';
WithdrawModal.propTypes = { isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, profitBalance: PropTypes.number.isRequired, onRequestWithdraw: PropTypes.func.isRequired };