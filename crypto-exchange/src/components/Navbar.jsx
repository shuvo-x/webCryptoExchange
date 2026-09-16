import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Copy, CheckCircle2, LogOut, ShieldAlert, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';
import { theme } from '../theme';

export const Navbar = () => {
  const { user, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Screen size বদলে গেলে (রোটেট বা resize) খোলা মেনু বন্ধ করে দেওয়া হচ্ছে
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [isMobile]);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavClick = () => setIsMobileMenuOpen(false);

  const navLinks = (
    <>
      <Link to="/markets" onClick={handleNavClick} style={{ color: theme.colors.textPrimary, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Markets</Link>
      <Link to="/trade/BTCUSDT" onClick={handleNavClick} style={{ color: theme.colors.textPrimary, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Trade</Link>
      {user && (
        <Link to="/wallet" onClick={handleNavClick} style={{ color: theme.colors.textPrimary, textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Wallet</Link>
      )}
    </>
  );

  return (
    <nav style={{ background: theme.colors.bgCard, borderBottom: `1px solid ${theme.colors.border}`, fontFamily: theme.font.family, position: 'relative' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.accent, fontWeight: 'bold', fontSize: '20px', textDecoration: 'none' }}>
            <Zap size={22} /> NEXTEX
          </Link>

          {!isMobile && <div style={{ display: 'flex', gap: '28px' }}>{navLinks}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {loading ? (
            <div style={{ width: '90px', height: '36px', background: theme.colors.bgInput, borderRadius: theme.radius.md, opacity: 0.5 }} />
          ) : user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ background: theme.colors.bgInput, border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.radius.md, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#fff' }}
              >
                <div style={{ background: theme.colors.accent, width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="#000" />
                </div>
                {!isMobile && <ChevronDown size={14} color={theme.colors.textSecondary} style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />}
              </button>

              {isProfileOpen && (
                <div style={{ position: 'absolute', top: '46px', right: 0, width: '260px', maxWidth: 'calc(100vw - 32px)', background: theme.colors.bgCard, border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.radius.lg, boxShadow: '0px 10px 30px rgba(0,0,0,0.5)', padding: '16px', zIndex: 1000 }}>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>Email</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '14px', wordBreak: 'break-all' }}>{user.email}</div>

                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary, marginBottom: '4px' }}>User ID</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: theme.colors.bgSecondary, padding: '8px', borderRadius: theme.radius.sm, marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', color: theme.colors.textSecondary, wordBreak: 'break-all', flex: 1 }}>{user.id}</span>
                    <button onClick={handleCopyUid} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textSecondary, flexShrink: 0 }}>
                      {copied ? <CheckCircle2 size={14} color={theme.colors.positive} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {isAdmin && (
                    <div style={{ fontSize: '11px', color: theme.colors.accent, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={12} /> Admin Account
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', background: theme.colors.negativeBg, color: theme.colors.negative, border: 'none', padding: '10px', borderRadius: theme.radius.sm, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isMobile && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/login" style={{ color: theme.colors.textPrimary, textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', padding: '8px 16px' }}>Log In</Link>
                <Link to="/signup" style={{ background: theme.colors.accent, color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', padding: '8px 16px', borderRadius: theme.radius.sm }}>Sign Up</Link>
              </div>
            )
          )}

          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && isMobileMenuOpen && (
        <div style={{ background: theme.colors.bgSecondary, borderTop: `1px solid ${theme.colors.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {navLinks}
          {!user && !loading && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Link to="/login" onClick={handleNavClick} style={{ flex: 1, textAlign: 'center', color: theme.colors.textPrimary, textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', padding: '10px', border: `1px solid ${theme.colors.borderStrong}`, borderRadius: theme.radius.sm }}>Log In</Link>
              <Link to="/signup" onClick={handleNavClick} style={{ flex: 1, textAlign: 'center', background: theme.colors.accent, color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', padding: '10px', borderRadius: theme.radius.sm }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};