import React, { useState, useEffect } from 'react';

export const toast = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('sg-toast', { detail: { message, type } }));
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('sg-toast', handleToast);
    return () => window.removeEventListener('sg-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#22c55e' : '#1e293b',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'toast-in 0.2s ease-out forwards',
          }}
        >
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
