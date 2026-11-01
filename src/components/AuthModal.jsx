import { useState } from 'react';
import { loginUser, registerUser } from '../api';

function AuthModal({ isOpen, onClose, onAuthSuccess, initialMessage }) {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(initialMessage || '');
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (mode === 'register') {
                if (password.length < 6) {
                    setErrorMessage('Password must be at least 6 characters long');
                    setLoading(false);
                    return;
                }
                const res = await registerUser({ email, password, name });
                setSuccessMessage(res.message || 'Registration successful! Logging you in...');
                // Auto login after register
                const loginRes = await loginUser({ email, password });
                if (onAuthSuccess) onAuthSuccess(loginRes.user);
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                const res = await loginUser({ email, password });
                setSuccessMessage('Logged in successfully!');
                if (onAuthSuccess) onAuthSuccess(res.user);
                setTimeout(() => {
                    onClose();
                }, 800);
            }
        } catch (err) {
            setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleFillDemo = () => {
        setEmail('demo@charusat.edu.in');
        setPassword('password123');
        setMode('login');
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--surface-border, rgba(226, 232, 240, 0.8))',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '440px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    type="button"
                    style={{
                        position: 'absolute',
                        top: '18px',
                        right: '18px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        color: 'var(--text-muted, #64748b)'
                    }}
                    title="Close"
                >
                    ✕
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--primary-light, #e0e7ff)',
                        color: 'var(--primary, #4f46e5)',
                        fontSize: '1.5rem',
                        marginBottom: '12px'
                    }}>
                        🔐
                    </div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: 'var(--on-bg, #0f172a)'
                    }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                    </h2>
                    <p style={{
                        margin: '6px 0 0',
                        fontSize: '0.88rem',
                        color: 'var(--text-muted, #64748b)'
                    }}>
                        {mode === 'login' 
                            ? 'Sign in to access JWT-protected task routes' 
                            : 'Register to get full access to the task manager'}
                    </p>
                </div>

                {/* Mode Tabs */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'var(--surface-sunken, #f1f5f9)',
                    borderRadius: '10px',
                    padding: '4px',
                    marginBottom: '20px'
                }}>
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setErrorMessage(''); }}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            backgroundColor: mode === 'login' ? 'var(--surface, #ffffff)' : 'transparent',
                            color: mode === 'login' ? 'var(--primary, #4f46e5)' : 'var(--text-muted, #64748b)',
                            boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setErrorMessage(''); }}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            backgroundColor: mode === 'register' ? 'var(--surface, #ffffff)' : 'transparent',
                            color: mode === 'register' ? 'var(--primary, #4f46e5)' : 'var(--text-muted, #64748b)',
                            boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Register
                    </button>
                </div>

                {/* Status Messages */}
                {errorMessage && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '0.85rem',
                        marginBottom: '16px'
                    }}>
                        ⚠️ {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontSize: '0.85rem',
                        marginBottom: '16px'
                    }}>
                        ✔ {successMessage}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mode === 'register' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px', color: 'var(--on-bg, #1e293b)' }}>
                                Full Name (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Student Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--surface-border, #cbd5e1)',
                                    backgroundColor: 'var(--surface, #ffffff)',
                                    color: 'var(--on-bg, #0f172a)',
                                    fontSize: '0.92rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px', color: 'var(--on-bg, #1e293b)' }}>
                            Email Address *
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="student@charusat.edu.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--surface-border, #cbd5e1)',
                                backgroundColor: 'var(--surface, #ffffff)',
                                color: 'var(--on-bg, #0f172a)',
                                fontSize: '0.92rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px', color: 'var(--on-bg, #1e293b)' }}>
                            Password * (min 6 characters)
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--surface-border, #cbd5e1)',
                                backgroundColor: 'var(--surface, #ffffff)',
                                color: 'var(--on-bg, #0f172a)',
                                fontSize: '0.92rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '8px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'var(--primary, #4f46e5)',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'background-color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading && <span>⏳</span>}
                        <span>{mode === 'login' ? 'Sign In with JWT' : 'Register Account'}</span>
                    </button>
                </form>

                {/* Demo autofill button */}
                <div style={{ marginTop: '18px', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={handleFillDemo}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary, #4f46e5)',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        ⚡ Fill Demo Credentials (demo@charusat.edu.in)
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
