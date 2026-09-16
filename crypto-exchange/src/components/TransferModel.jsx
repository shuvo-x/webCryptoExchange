import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowDownUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransferSpotToFutures, useTransferFuturesToSpot } from '../hooks/useWalletQueries';

export const TransferModal = React.memo(({ isOpen, onClose }) => {
  const { balances, bonusLockedAmount, refreshProfile } = useAuth();
  const [direction, setDirection] = useState('spot_to_futures'); // 'spot_to_futures' | 'futures_to_spot'
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const spotToFutures = useTransferSpotToFutures();
  const futuresToSpot = useTransferFuturesToSpot();
  const isPending = spotToFutures.isPending || futuresToSpot.isPending;

  if (!isOpen) return null;

  const fromLabel = direction === 'spot_to_futures' ? 'Spot' : 'Futures';
  const toLabel = direction === 'spot_to_futures' ? 'Futures' : 'Spot';

  const transferableFuturesToSpot = Math.max(balances.futures - bonusLockedAmount, 0);
  const fromAvailable = direction === 'spot_to_futures' ? balances.spot : transferableFuturesToSpot;

  const handleClose = () => {
    setAmount('');
    setErrorMsg('');
    onClose();
  };

  const handleSwap = () => {
    setDirection((prev) => (prev === 'spot_to_futures' ? 'futures_to_spot' : 'spot_to_futures'));
    setAmount('');
    setErrorMsg('');
  };

  const handleMax = () => {
    setAmount(String(fromAvailable));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setErrorMsg('সঠিক amount দিন।');
      return;
    }

    if (numAmount > fromAvailable) {
      setErrorMsg(`Amount exceeds available ${fromLabel} balance!`);
      return;
    }

    try {
      if (direction === 'spot_to_futures') {
        await spotToFutures.mutateAsync(numAmount);
      } else {
        await futuresToSpot.mutateAsync(numAmount);
      }
      await refreshProfile();
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Transfer সম্পন্ন করা যায়নি।');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e2329', padding: '24px', borderRadius: '8px', color: '#fff', width: '380px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Transfer</h3>

        {/* From box */}
        <div style={{ background: '#181a20', border: '1px solid #2b313a', borderRadius: '8px', padding: '14px', marginBottom: '4px' }}>
          <div style={{ fontSize: '11px', color: '#848e9c', marginBottom: '4px' }}>From</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{fromLabel}</span>
            <span style={{ fontSize: '12px', color: '#848e9c' }}>Available: {fromAvailable.toFixed(2)} USDT</span>
          </div>
        </div>

        {/* Swap button */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
          <button
            type="button"
            onClick={handleSwap}
            style={{ background: '#2b313a', border: '3px solid #1e2329', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1 }}
          >
            <ArrowDownUp size={14} color="#f0b90b" />
          </button>
        </div>

        {/* To box */}
        <div style={{ background: '#181a20', border: '1px solid #2b313a', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#848e9c', marginBottom: '4px' }}>To</div>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{toLabel}</span>
        </div>

        {direction === 'futures_to_spot' && bonusLockedAmount > 0 && (
          <div style={{ fontSize: '11px', color: '#848e9c', marginBottom: '12px' }}>
            ⓘ ${bonusLockedAmount.toFixed(2)} bonus locked আছে, শুধু profit অংশ transfer করা যাবে
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#f6465d', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: '#848e9c' }}>Amount (USDT)</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                max={fromAvailable}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ flex: 1, padding: '8px', background: '#2b313a', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={handleMax}
                style={{ background: '#2b313a', border: '1px solid #f0b90b', color: '#f0b90b', padding: '0 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Max
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{ width: '100%', padding: '10px', background: '#f0b90b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isPending ? 'not-allowed' : 'pointer', marginBottom: '8px', opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? 'Transferring...' : 'Confirm Transfer'}
          </button>
          <button type="button" onClick={handleClose} style={{ width: '100%', padding: '8px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
});

TransferModal.displayName = 'TransferModal';
TransferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};