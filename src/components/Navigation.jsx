import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Navigation({ isDarkMode, onToggleTheme }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/projects', label: 'Tasks' },
        { path: '/contact', label: 'Contact' }
    ];

    return (
        <nav style={{
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--surface-border)',
            padding: '16px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <Link 
                to="/" 
                style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-heading)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span>✦</span>
                <span>Portfolio</span>
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ul style={{
                    display: 'flex',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    gap: '8px',
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <li key={link.path}>
                                <Link 
                                    to={link.path} 
                                    style={{
                                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                        backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: isActive ? '600' : '500',
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-xl)',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-block'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.target.style.color = 'var(--on-bg)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.target.style.color = 'var(--text-muted)';
                                    }}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Supplementary Problem 2: Dark / Light Mode Toggle Button */}
                <button
                    onClick={onToggleTheme}
                    type="button"
                    aria-label="Toggle dark/light mode"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-xl)',
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'var(--secondary-light)',
                        color: isDarkMode ? '#f8fafc' : 'var(--secondary)',
                        border: '1px solid var(--surface-border)',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                    }}
                >
                    <span>{isDarkMode ? '☀️' : '🌙'}</span>
                    <span>{isDarkMode ? 'Light' : 'Dark'}</span>
                </button>
            </div>
        </nav>
    );
}

export default Navigation;
