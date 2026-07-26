function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div
            className="clean-panel"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                minHeight: '220px',
                textAlign: 'center'
            }}
            aria-live="polite"
            aria-busy="true"
        >
            <div
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: '5px solid rgba(13, 148, 136, 0.15)',
                    borderTopColor: 'var(--primary)',
                    animation: 'spin 0.9s linear infinite'
                }}
                aria-hidden="true"
            />
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{message}</p>
        </div>
    );
}

export default LoadingSpinner;