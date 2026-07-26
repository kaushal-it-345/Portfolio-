function ErrorMessage({ message }) {
    return (
        <div
            className="clean-panel"
            style={{
                padding: '28px',
                borderColor: 'rgba(220, 38, 38, 0.18)',
                background: 'linear-gradient(180deg, rgba(254, 242, 242, 0.9), rgba(255, 255, 255, 1))'
            }}
            role="alert"
        >
            <h2 style={{ color: '#b91c1c', marginBottom: '12px' }}>Unable to load repositories</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{message}</p>
        </div>
    );
}

export default ErrorMessage;