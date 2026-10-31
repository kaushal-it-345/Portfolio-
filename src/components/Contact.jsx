import { useState } from 'react';

function Contact() {
    // State 1: Form input (controlled inputs)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // State 2: Toggle UI visibility for Help Tooltip (Lab Manual Step 6: "Add a second useState variable to toggle visibility of an element (e.g., a help tooltip)")
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);

    // State 3: Toggle for showing submission feedback
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Character limit for message
    const MESSAGE_MAX_LENGTH = 500;

    // Handle input change - captures user input in real time
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuccessMessage(true);
        
        // Auto dismiss and reset after 4 seconds
        setTimeout(() => {
            setFormData({ name: '', email: '', message: '' });
            setShowSuccessMessage(false);
        }, 4000);
    };

    return (
        <div style={{ padding: '32px 16px', maxWidth: '640px', margin: '0 auto' }}>
            <div className="clean-panel" style={{ padding: '36px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            fontFamily: 'var(--font-heading)',
                            marginBottom: '8px',
                            color: 'var(--on-bg)'
                        }}>
                            Get In Touch
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                            Have a question or want to collaborate? Send a message below.
                        </p>
                    </div>

                    {/* Step 6: useState toggle for Help Tooltip element */}
                    <button
                        type="button"
                        onClick={() => setShowHelpTooltip(prev => !prev)}
                        style={{
                            background: showHelpTooltip ? 'var(--primary)' : 'var(--accent-light)',
                            color: showHelpTooltip ? 'white' : 'var(--primary-hover)',
                            border: '1px solid var(--primary)',
                            borderRadius: 'var(--radius-xl)',
                            padding: '6px 14px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                        }}
                        aria-expanded={showHelpTooltip}
                    >
                        <span>💡</span>
                        <span>{showHelpTooltip ? 'Hide Help' : 'Help Tooltip'}</span>
                    </button>
                </div>

                <div style={{ 
                    width: '50px', 
                    height: '3px', 
                    backgroundColor: 'var(--primary)', 
                    margin: '20px 0 28px' 
                }}></div>

                {/* Conditional UI Element toggled by showHelpTooltip state */}
                {showHelpTooltip && (
                    <div style={{
                        backgroundColor: 'var(--secondary-light)',
                        border: '1px solid rgba(64, 89, 170, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 20px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        color: 'var(--on-bg)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>ℹ️</span> Form Guidelines & Help
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            <li>All fields are controlled components managed by React <code style={{ backgroundColor: 'rgba(0,0,0,0.06)', padding: '2px 4px', borderRadius: '4px' }}>useState</code>.</li>
                            <li>Check the real-time preview and live character count below each input.</li>
                            <li>Maximum message length is <strong>{MESSAGE_MAX_LENGTH}</strong> characters.</li>
                        </ul>
                    </div>
                )}

                {/* Conditional Success Alert toggled by showSuccessMessage state */}
                {showSuccessMessage && (
                    <div style={{
                        backgroundColor: 'rgba(13, 148, 136, 0.12)',
                        color: 'var(--primary-hover)',
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '24px',
                        border: '1px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500'
                    }}>
                        <span>✓</span>
                        <span>Thank you, <strong>{formData.name}</strong>! Your message was submitted successfully.</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            fontSize: '0.92rem',
                            color: 'var(--on-bg)'
                        }}>
                            Name <span style={{ color: 'var(--primary)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Jane Doe"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: '0.98rem',
                                border: '1.5px solid var(--surface-border)',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'inherit',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--on-bg)',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                        />
                        {/* Live real-time capture display */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                                Live value: <strong style={{ color: 'var(--primary)' }}>{formData.name || '(empty)'}</strong>
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                                {formData.name.length} chars
                            </span>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            fontSize: '0.92rem',
                            color: 'var(--on-bg)'
                        }}>
                            Email <span style={{ color: 'var(--primary)' }}>*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="jane@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: '0.98rem',
                                border: '1.5px solid var(--surface-border)',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'inherit',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--on-bg)',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                        />
                        {/* Live real-time capture display */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                                Live value: <strong style={{ color: 'var(--primary)' }}>{formData.email || '(empty)'}</strong>
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                                {formData.email.length} chars
                            </span>
                        </div>
                    </div>

                    {/* Message Textarea */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor="message" style={{
                                fontWeight: '600',
                                fontSize: '0.92rem',
                                color: 'var(--on-bg)'
                            }}>
                                Message <span style={{ color: 'var(--primary)' }}>*</span>
                            </label>
                            {/* Supplementary Problem 3: Live character count display */}
                            <span style={{
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                color: formData.message.length > MESSAGE_MAX_LENGTH ? '#ef4444' : 'var(--text-muted)',
                                backgroundColor: 'var(--accent-light)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-xl)'
                            }}>
                                {formData.message.length} / {MESSAGE_MAX_LENGTH} characters
                            </span>
                        </div>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            maxLength={MESSAGE_MAX_LENGTH}
                            placeholder="Type your message here..."
                            rows="4"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                fontSize: '0.98rem',
                                border: '1.5px solid var(--surface-border)',
                                borderRadius: 'var(--radius-sm)',
                                fontFamily: 'inherit',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--on-bg)',
                                boxSizing: 'border-box',
                                resize: 'vertical',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
                        />
                        {/* Real-time live capture preview for message */}
                        <div style={{
                            marginTop: '8px',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            borderLeft: '3px solid var(--primary)'
                        }}>
                            <strong>Live preview:</strong> {formData.message || 'Start typing above to see real-time updates...'}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            padding: '14px 28px',
                            fontSize: '1rem',
                            border: 'none',
                            borderRadius: 'var(--radius-xl)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '8px',
                            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'var(--primary-hover)';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'var(--primary)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        <span>Send Message</span>
                        <span>→</span>
                    </button>
                </form>

                <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--on-bg)', marginBottom: '12px' }}>
                        Other ways to connect:
                    </h3>
                    <p style={{ color: 'var(--text-muted)', margin: '6px 0', fontSize: '0.92rem' }}>
                        📧 Email: <strong style={{ color: 'var(--on-bg)' }}>d25it127@charusat.edu.in</strong>
                    </p>
                    <p style={{ color: 'var(--text-muted)', margin: '6px 0', fontSize: '0.92rem' }}>
                        💼 LinkedIn: <strong style={{ color: 'var(--on-bg)' }}>Kaushal Patel</strong>
                    </p>
                    <p style={{ color: 'var(--text-muted)', margin: '6px 0', fontSize: '0.92rem' }}>
                        🐙 GitHub: <strong style={{ color: 'var(--on-bg)' }}>@kaushalpatel</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Contact;
