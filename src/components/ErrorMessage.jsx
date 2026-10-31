function ErrorMessage({ message, onRetry }) {
    return (
        <div
            className="clean-panel"
            style={{
                padding: '36px 24px',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                background: 'var(--surface)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                margin: '20px 0'
            }}
            role="alert"
        >
            <div style={{
                fontSize: '2rem',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
            }}>
                ⚠️
            </div>
            <div>
                <h2 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '1.4rem' }}>
                    Unable to load repositories
                </h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: '480px', fontSize: '0.95rem' }}>
                    {message}
                </p>
            </div>
            {/* Supplementary Problem: Retry button */}
            {onRetry && (
                <button
                    onClick={onRetry}
                    type="button"
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: 'var(--radius-xl)',
                        fontWeight: '600',
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-hover)';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--primary)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    <span>🔄</span>
                    <span>Retry Request</span>
                </button>
            )}
        </div>
    );
}

export default ErrorMessage;