function Skills ({title, skills}){
    return(
        <section className="clean-panel" style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '24px', color: 'var(--on-bg)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '6px', height: '24px', backgroundColor: 'var(--secondary)', display: 'inline-block', borderRadius: 'var(--radius-xl)' }}></span>
                {title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {skills.map((skill, index) => {
                    const isEven = index % 2 === 0;
                    const badgeBg = isEven ? 'var(--accent-light)' : 'var(--secondary-light)';
                    const badgeColor = isEven ? 'var(--primary)' : 'var(--secondary)';
                    
                    return (
                        <div 
                            key={index} 
                            style={{
                                padding: '10px 22px',
                                borderRadius: 'var(--radius-xl)',
                                background: badgeBg,
                                border: '1px solid transparent',
                                color: badgeColor,
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                letterSpacing: '0.03em',
                                cursor: 'default',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.border = `1px solid ${badgeColor}`;
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(64, 89, 170, 0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.border = '1px solid transparent';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {skill}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default Skills;