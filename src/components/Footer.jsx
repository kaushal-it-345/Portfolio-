function Footer({email}){
    return(
        <footer className="clean-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Get in Touch:</span>
                <a 
                    href={`mailto:${email}`} 
                    className="btn-secondary" 
                    style={{ padding: '8px 20px', fontSize: '0.85rem', textDecoration: 'none', borderRadius: 'var(--radius-xl)' }}
                >
                    {email}
                </a>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                &copy; {new Date().getFullYear()} Student Portfolio.
            </p>
        </footer>
    )
}

export default Footer; 