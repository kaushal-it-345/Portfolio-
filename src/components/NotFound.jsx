import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <section 
            className="clean-panel" 
            style={{ 
                textAlign: 'center', 
                padding: '64px 24px', 
                maxWidth: '600px', 
                margin: '40px auto' 
            }}
        >
            <div 
                style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    letterSpacing: '0.08em',
                    marginBottom: '16px',
                    textTransform: 'uppercase'
                }}
            >
                404 Error
            </div>
            <h1 
                style={{ 
                    fontSize: '3rem', 
                    fontFamily: 'var(--font-heading)', 
                    marginBottom: '16px',
                    color: 'var(--on-bg)' 
                }}
            >
                Page Not Found
            </h1>
            <p 
                style={{ 
                    fontSize: '1.1rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.7', 
                    marginBottom: '32px' 
                }}
            >
                Oops! The page you are looking for does not exist or has been moved.
            </p>
            <div>
                <Link 
                    to="/" 
                    className="btn-secondary"
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '12px 28px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                        borderRadius: 'var(--radius-xl)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
                    }}
                >
                    ← Back to Home
                </Link>
            </div>
        </section>
    );
}

export default NotFound;
