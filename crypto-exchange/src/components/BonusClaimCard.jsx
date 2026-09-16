import React from 'react';
import { Gift, Lock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClaimBonus } from '../hooks/useBonusMutation';
import { theme } from '../theme';

export const BonusClaimCard = () => {
  const { bonusStatus, refreshProfile } = useAuth();
  const claimBonus = useClaimBonus();

  // claim হয়ে গেলে card আর দেখানো হয় না
  if (bonusStatus === 'claimed') return null;

  const handleClaim = async () => {
    try {
      await claimBonus.mutateAsync();
      await refreshProfile();
    } catch (err) {
      alert(err.message || 'Bonus claim করা যায়নি।');
    }
  };

  const isEligible = bonusStatus === 'eligible';
  const isIneligible = bonusStatus === 'ineligible';

  return (
    <div
      style={{
        background: isEligible ? 'linear-gradient(135deg, rgba(240,185,11,0.15), rgba(240,185,11,0.05))' : theme.colors.bgCard,
        border: `1px solid ${isEligible ? theme.colors.accent : theme.colors.border}`,
        borderRadius: theme.radius.lg,
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: isEligible ? theme.colors.accent : theme.colors.bgInput, borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isIneligible ? <XCircle size={22} color={theme.colors.negative} /> : <Gift size={22} color={isEligible ? '#000' : theme.colors.textSecondary} />}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>10 USDT Trial Bonus (100x Futures)</div>
          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            {isEligible && <>Claim করার জন্য প্রস্তুত!</>}
            {isIneligible && <>❌ প্রথম deposit 5 USDT-এর কম ছিল, এই bonus আর claim করা যাবে না</>}
            {!isEligible && !isIneligible && (
              <>
                <Lock size={12} /> Claim করতে হলে প্রথম deposit-ই কমপক্ষে 5 USDT হতে হবে
              </>
            )}
          </div>
        </div>
      </div>

      {!isIneligible && (
        <button
          onClick={handleClaim}
          disabled={!isEligible || claimBonus.isPending}
          style={{
            background: isEligible ? theme.colors.accent : theme.colors.bgInput,
            color: isEligible ? '#000' : theme.colors.textSecondary,
            border: 'none',
            padding: '10px 24px',
            borderRadius: theme.radius.md,
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: isEligible ? 'pointer' : 'not-allowed',
          }}
        >
          {claimBonus.isPending ? 'Claiming...' : isEligible ? 'Claim Now' : 'Deposit 5 USDT First'}
        </button>
      )}
    </div>
  );
};