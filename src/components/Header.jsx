function Header({name}){
    return(
        <header className="clean-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '48px' }}>
            <h1 style={{ fontSize: '3.25rem', fontFamily: 'var(--font-heading)', fontWeight: '400', letterSpacing: '-0.01em', color: 'var(--on-bg)' }}>
                {name}
            </h1>
            <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--primary)', margin: '4px 0' }}></div>
            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Student Portfolio
            </p>
        </header>
    );
}

export default Header;