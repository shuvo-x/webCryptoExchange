import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const STORAGE_KEY = 'nextex_auth_state';
const DEFAULT_BALANCES = { trial: 10.0, deposit: 0.0, profit: 0.0 };

const loadPersistedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read persisted auth state:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const persisted = loadPersistedState();
  const [user, setUser] = useState(persisted?.user ?? null);
  const [balances, setBalances] = useState(persisted?.balances ?? DEFAULT_BALANCES);

  // user/balances বদলালেই localStorage-এ sync হয়, refresh করলেও session থাকবে
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, balances }));
    } catch (error) {
      console.error('Failed to persist auth state:', error);
    }
  }, [user, balances]);

  const login = (email) => setUser({ email, id: 'USR-' + Math.floor(Math.random() * 10000) });
  const signup = (email) => setUser({ email, id: 'USR-' + Math.floor(Math.random() * 10000) });
  const logout = () => { setUser(null); setBalances(DEFAULT_BALANCES); };
  const updateBalance = (type, amount) => setBalances((prev) => ({ ...prev, [type]: prev[type] + amount }));

  return (
    <AuthContext.Provider value={{ user, balances, login, signup, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);