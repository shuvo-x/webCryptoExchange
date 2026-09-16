import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

// Profile load fail করলে পুরো app-এর উপরে একটা persistent banner দেখাবে, Retry বাটন সহ
export const ProfileErrorBanner = () => {
  const { user, profile, profileError, refreshProfile } = useAuth();

  if (!user || profile || !profileError) return null;

  return (
    <div style={{ background: theme.colors.negativeBg, borderBottom: `1px solid ${theme.colors.negative}`, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '13px', color: theme.colors.negative }}>
      <AlertTriangle size={16} />
      <span>{profileError}</span>
      <button
        onClick={refreshProfile}
        style={{ background: 'none', border: `1px solid ${theme.colors.negative}`, color: theme.colors.negative, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}
      >
        <RotateCw size={12} /> Retry
      </button>
    </div>
  );
};