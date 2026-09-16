import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

const ICONS = {
  success: <CheckCircle2 size={18} color="#0ecb81" />,
  error: <XCircle size={18} color="#f6465d" />,
  warning: <AlertTriangle size={18} color="#f0b90b" />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 9999 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#1e2329',
              border: `1px solid ${t.type === 'success' ? '#0ecb81' : t.type === 'error' ? '#f6465d' : '#f0b90b'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '260px',
              maxWidth: '360px',
              color: '#fff',
              fontSize: '13px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              animation: 'toast-in 0.2s ease-out',
            }}
          >
            {ICONS[t.type]}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);