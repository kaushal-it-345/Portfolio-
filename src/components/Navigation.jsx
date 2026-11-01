import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getToken, getUserProfile, clearAuth, getMe } from '../api';
import AuthModal from './AuthModal';

function Navigation({ isDarkMode, onToggleTheme }) {
    const location = useLocation();
    const [user, setUser] = useState(getUserProfile());
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMessage, setAuthModalMessage] = useState('');

    // Sync auth state and listen for global events
    useEffect(() => {
        // Initial token verification with /me if token exists
        if (getToken()) {
            getMe()
                .then(profile => {
                    setUser(profile);
                })
                .catch(() => {
                    setUser(null);
                });
        }

        const handleAuthChange = (e) => {
            if (e.detail?.isAuthenticated) {
                setUser(e.detail.user || getUserProfile());
            } else {
                setUser(null);
            }
        };

        const handleAuthExpired = (e) => {
            setUser(null);
            setAuthModalMessage(e.detail?.message || 'Session expired. Please log in again.');
            setIsAuthModalOpen(true);
        };

        window.addEventListener('auth:change', handleAuthChange);
        window.addEventListener('auth:expired', handleAuthExpired);

        return () => {
            window.removeEventListener('auth:change', handleAuthChange);
            window.removeEventListener('auth:expired', handleAuthExpired);
        };
    }, []);

    const handleLogout = () => {
        clearAuth();
        setUser(null);
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/projects', label: 'Tasks' },
        { path: '/contact', label: 'Contact' }
    ];

    return (
        <>
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

                    {/* Practical 7 Auth Controls: User info badge & Login/Logout buttons */}
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-xl)',
                                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                color: 'var(--primary, #4f46e5)',
                                fontSize: '0.85rem',
                                fontWeight: '600'
                            }}>
                                <span>👤</span>
                                <span>{user.name || user.email?.split('@')[0]}</span>
                            </div>

                            {/* Supplementary Problem 3: Logout mechanism */}
                            <button
                                onClick={handleLogout}
                                type="button"
                                style={{
                                    padding: '7px 14px',
                                    borderRadius: 'var(--radius-xl)',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#ef4444';
                                    e.target.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#ef4444';
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                setAuthModalMessage('');
                                setIsAuthModalOpen(true);
                            }}
                            type="button"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '7px 16px',
                                borderRadius: 'var(--radius-xl)',
                                backgroundColor: 'var(--primary, #4f46e5)',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.88rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>🔐</span>
                            <span>Sign In</span>
                        </button>
                    )}

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

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthSuccess={(userData) => {
                    setUser(userData);
                }}
                initialMessage={authModalMessage}
            />
        </>
    );
}

export default Navigation;
