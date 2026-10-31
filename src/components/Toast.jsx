import { useEffect } from 'react';

function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  const bgColor = isSuccess
    ? 'rgba(16, 185, 129, 0.95)'
    : isError
    ? 'rgba(239, 68, 68, 0.95)'
    : 'rgba(59, 130, 246, 0.95)';

  const icon = isSuccess ? '✓' : isError ? '✕' : 'ℹ';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        backgroundColor: bgColor,
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: 'var(--radius-md, 12px)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.95rem',
        fontWeight: '500',
        backdropFilter: 'blur(8px)',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '420px',
        wordBreak: 'break-word'
      }}
    >
      <span
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.85rem'
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.1rem',
          cursor: 'pointer',
          padding: '2px 6px',
          opacity: 0.8,
          lineHeight: 1
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
