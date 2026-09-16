import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useWithdrawMutation } from '../hooks/useWalletQueries';
import { useAuth } from '../context/AuthContext';

export const WithdrawModal = React.memo(({ isOpen, onClose }) => {
  const { balances, refreshProfile } = useAuth();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const withdrawMutation = useWithdrawMutation();
  const withdrawable = balances.spot; // এখন শুধু Spot balance withdrawable

  if (!isOpen) return null;

  const handleClose = () => {
    setAddress('');
    setAmount('');
    setErrorMsg('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const numAmount = Number(amount);

    if (numAmount > withdrawable) {
      setErrorMsg('Amount exceeds Spot balance!');
      return;
    }

    try {
      await withdrawMutation.mutateAsync({ amount: numAmount, walletAddress: address });
      await refreshProfile();
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Withdraw request পাঠানো যায়নি।');
    }
  };

  if (success) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ background: '#1e2329', padding: '24px', borderRadius: '8px', color: '#fff', width: '360px', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0 }}>✅ Withdraw Request Submitted</h3>
          <p style={{ fontSize: '13px', color: '#848e9c' }}>
            আপনার request Pending অবস্থায় আছে। Admin verify করে আপনার address-এ manually পাঠিয়ে দিবেন।
          </p>
          <button onClick={handleClose} style={{ width: '100%', padding: '10px', background: '#f0b90b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e2329', padding: '24px', borderRadius: '8px', color: '#fff', width: '360px' }}>
        <h3 style={{ marginTop: 0 }}>Withdraw (Spot Wallet)</h3>
        <p style={{ fontSize: '12px', color: '#848e9c' }}>
          Spot Balance: <strong style={{ color: '#0ecb81' }}>${withdrawable.toFixed(2)} USDT</strong>
          <br />
          <span style={{ fontSize: '11px' }}>(Futures/Trial balance withdraw করতে হলে আগে Spot-এ Transfer করুন)</span>
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#f6465d', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#848e9c' }}>TRC20 Wallet Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#2b313a', border: 'none', color: '#fff', borderRadius: '4px', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: '#848e9c' }}>Amount (USDT)</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              max={withdrawable}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#2b313a', border: 'none', color: '#fff', borderRadius: '4px', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={withdrawMutation.isPending}
            style={{ width: '100%', padding: '10px', background: '#f0b90b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}
          >
            {withdrawMutation.isPending ? 'Submitting...' : 'Submit Withdrawal'}
          </button>
          <button type="button" onClick={handleClose} style={{ width: '100%', padding: '8px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
});

WithdrawModal.displayName = 'WithdrawModal';
WithdrawModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};