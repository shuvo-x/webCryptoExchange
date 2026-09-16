import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCreateDepositRequest, useDepositStatus } from '../hooks/useDeposit';

const WALLET_ADDRESS = import.meta.env.VITE_TRON_WALLET_ADDRESS;

export const DepositModal = React.memo(({ isOpen, onClose }) => {
  const { refreshProfile } = useAuth();
  const [amountInput, setAmountInput] = useState('');
  const [deposit, setDeposit] = useState(null); // { id, exact_amount, expected_amount, status }
  const [copied, setCopied] = useState(false);

  const createRequest = useCreateDepositRequest();
  const { data: liveDeposit } = useDepositStatus(deposit?.id);

  const currentStatus = liveDeposit?.status ?? deposit?.status;

  // সব hook (useState/useEffect ইত্যাদি) component-এর একদম উপরে, কোনো early return-এর আগে থাকতে হবে -
  // এটাই React-এর নিয়ম, আগে এটা নিচে ছিল যেটা "Rendered more hooks" error দিচ্ছিল
  useEffect(() => {
    if (currentStatus === 'confirmed') {
      refreshProfile();
    }
  }, [currentStatus, refreshProfile]);

  if (!isOpen) return null;

  const handleClose = () => {
    setAmountInput('');
    setDeposit(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(amountInput);
    if (!amount || amount < 1) return;

    try {
      const row = await createRequest.mutateAsync(amount);
      setDeposit(row);
    } catch (err) {
      alert(err.message || 'Deposit request তৈরি করা যায়নি, আবার চেষ্টা করুন।');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(deposit.exact_amount));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e2329', padding: '24px', borderRadius: '8px', color: '#fff', width: '380px' }}>

        {/* Step 1: amount input */}
        {!deposit && (
          <>
            <h3 style={{ marginTop: 0 }}>Deposit USDT (TRC20)</h3>
            <p style={{ fontSize: '13px', color: '#848e9c' }}>কত USDT deposit করতে চান? (minimum 1)</p>
            <form onSubmit={handleSubmit}>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                autoFocus
                placeholder="যেমন: 20"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#181a20', border: '1px solid #2b313a', color: '#fff', borderRadius: '4px', marginBottom: '16px', boxSizing: 'border-box', fontSize: '14px' }}
              />
              <button
                type="submit"
                disabled={createRequest.isPending}
                style={{ width: '100%', padding: '10px', background: '#f0b90b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}
              >
                {createRequest.isPending ? 'তৈরি হচ্ছে...' : 'Continue'}
              </button>
              <button type="button" onClick={handleClose} style={{ width: '100%', padding: '8px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </form>
          </>
        )}

        {/* Step 2: QR + amount, validating */}
        {deposit && currentStatus === 'validating' && (
          <>
            <h3 style={{ marginTop: 0 }}>ঠিক এই amount-টা পাঠান</h3>

            <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <QRCodeSVG value={WALLET_ADDRESS} size={160} />
            </div>
            <p style={{ fontSize: '11px', color: '#848e9c', textAlign: 'center', marginTop: '-8px' }}>
              (QR স্ক্যান করলে শুধু address বসবে, amount নিচ থেকে কপি করুন)
            </p>

            <div style={{ background: '#181a20', padding: '10px', borderRadius: '4px', fontSize: '11px', color: '#848e9c', wordBreak: 'break-all', marginBottom: '12px' }}>
              {WALLET_ADDRESS}
            </div>

            <div style={{ background: '#181a20', border: '1px solid #f0b90b', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#848e9c', marginBottom: '4px' }}>Exact Amount (এটাই পাঠাতে হবে)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0b90b' }}>{deposit.exact_amount}</span>
                <button onClick={handleCopy} style={{ background: '#2b313a', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  {copied ? <CheckCircle2 size={14} color="#0ecb81" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#848e9c', fontSize: '13px', justifyContent: 'center' }}>
              <Loader2 size={16} className="animate-spin" /> Validating... (blockchain-এ confirm হওয়ার অপেক্ষায়)
            </div>

            <button type="button" onClick={handleClose} style={{ width: '100%', padding: '8px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '16px' }}>
              পরে চেক করব (Close)
            </button>
          </>
        )}

        {/* Step 3: confirmed */}
        {currentStatus === 'confirmed' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={48} color="#0ecb81" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>Deposit Confirmed!</h3>
            <p style={{ color: '#848e9c', fontSize: '13px' }}>{deposit.expected_amount} USDT আপনার balance-এ যোগ হয়েছে।</p>
            <button onClick={handleClose} style={{ width: '100%', padding: '10px', background: '#f0b90b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}>
              Close
            </button>
          </div>
        )}

        {/* Step 4: needs review (rare) */}
        {currentStatus === 'needs_review' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={40} color="#f0b90b" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>Manual Review-এ আছে</h3>
            <p style={{ color: '#848e9c', fontSize: '13px' }}>
              আপনার deposit শনাক্ত হয়েছে, কিন্তু admin manually যাচাই করে দেখছেন। কিছুক্ষণের মধ্যে confirm হয়ে যাবে।
            </p>
            <button onClick={handleClose} style={{ width: '100%', padding: '10px', background: '#2b313a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '12px' }}>
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
});

DepositModal.displayName = 'DepositModal';
DepositModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};