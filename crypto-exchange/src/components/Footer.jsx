import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{ background: '#121418', borderTop: '1px solid #2b313a', padding: '40px 24px 20px', color: '#848e9c', fontSize: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <h4 style={{ color: '#eaecef', marginBottom: '12px' }}>About Us</h4>
          <p style={{ fontSize: '13px', lineHeight: '1.6' }}>NEXTEX is a next-generation crypto derivatives exchange providing up to 100x leverage trading with ultra-low latency.</p>
        </div>
        <div>
          <h4 style={{ color: '#eaecef', marginBottom: '12px' }}>Products</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/markets" style={{ color: '#848e9c', textDecoration: 'none' }}>Markets</Link>
            <Link to="/trade/BTCUSDT" style={{ color: '#848e9c', textDecoration: 'none' }}>Futures Trading</Link>
            <Link to="/wallet" style={{ color: '#848e9c', textDecoration: 'none' }}>Wallet Overview</Link>
          </div>
        </div>
        <div>
          <h4 style={{ color: '#eaecef', marginBottom: '12px' }}>Support</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href="#" style={{ color: '#848e9c', textDecoration: 'none' }}>API Documentation</a>
            <a href="#" style={{ color: '#848e9c', textDecoration: 'none' }}>Trading Rules</a>
            <a href="#" style={{ color: '#848e9c', textDecoration: 'none' }}>Privacy Policy</a>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #1e2329', fontSize: '12px' }}>
        © {new Date().getFullYear()} NEXTEX Exchange. All rights reserved.
      </div>
    </footer>
  );
};