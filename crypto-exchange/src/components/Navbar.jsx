import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, balances, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ background: '#181a20', borderBottom: '1px solid #2b313a', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#eaecef' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#f0b90b', textDecoration: 'none' }}>
          ⚡ NEXTEX
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/markets" style={{ color: '#eaecef', textDecoration: 'none', fontSize: '14px' }}>Markets</Link>
          <Link to="/trade/BTCUSDT" style={{ color: '#eaecef', textDecoration: 'none', fontSize: '14px' }}>Trade</Link>
          <Link to="/wallet" style={{ color: '#eaecef', textDecoration: 'none', fontSize: '14px' }}>Wallet</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <div style={{ background: '#2b313a', padding: '6px 12px', borderRadius: '4px', fontSize: '13px' }}>
              <span style={{ color: '#848e9c', marginRight: '6px' }}>Avail:</span>
              <strong style={{ color: '#0ecb81' }}>${(balances.trial + balances.deposit + balances.profit).toFixed(2)} USDT</strong>
            </div>

            <Link to="/wallet" style={{ display: 'flex', alignItems: 'center', color: '#eaecef', textDecoration: 'none' }}>
              <Wallet size={18} style={{ marginRight: '6px' }} /> Wallet
            </Link>

            <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'transparent', border: 'none', color: '#848e9c', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#eaecef', textDecoration: 'none', padding: '8px 16px', fontSize: '14px' }}>Log In</Link>
            <Link to="/signup" style={{ background: '#f0b90b', color: '#000', textDecoration: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};