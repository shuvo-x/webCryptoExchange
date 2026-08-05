import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(formData.email, formData.password);
      setIsLoading(false);
      navigate('/wallet');
    }, 1200);
  };

  return (
    <div style={{ background: '#121418', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'sans-serif', color: '#fff' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#1e2329', borderRadius: '16px', border: '1px solid #2b313a', padding: '40px', boxShadow: '0px 20px 40px rgba(0,0,0,0.4)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f0b90b', fontWeight: 'bold', fontSize: '20px', marginBottom: '12px' }}>
            <ShieldCheck size={26} /> NEXTEX Exchange
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#eaecef' }}>Log In to Your Account</h2>
          <p style={{ color: '#848e9c', fontSize: '13px', margin: 0 }}>Welcome back! Please enter your details.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#848e9c', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#848e9c" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  background: '#181a20',
                  border: '1px solid #2b313a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: '#848e9c', fontWeight: 'bold' }}>Password</label>
              <a href="#forgot" style={{ fontSize: '12px', color: '#f0b90b', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#848e9c" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 40px',
                  background: '#181a20',
                  border: '1px solid #2b313a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#848e9c', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              background: '#f0b90b',
              color: '#000',
              border: 'none',
              padding: '14px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            {isLoading ? 'Logging in...' : 'Log In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#848e9c' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#f0b90b', textDecoration: 'none', fontWeight: 'bold' }}>
            Register Now
          </Link>
        </div>

      </div>
    </div>
  );
};