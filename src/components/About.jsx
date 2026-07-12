function About(){
    return(
        <section className="clean-panel" style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '16px', color: 'var(--on-bg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '6px', height: '24px', backgroundColor: 'var(--primary)', display: 'inline-block', borderRadius: 'var(--radius-xl)' }}></span>
                About Me
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.75' }}>
                I am a beginner learning React and frontend development.
            </p>
        </section>
    );
}

export default About;