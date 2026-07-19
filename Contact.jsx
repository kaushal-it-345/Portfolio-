import { useState } from 'react';

function Contact() {
    // State 1: Form input (controlled input)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    // State 2: Toggle for showing success message
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Handle input change - displays user input in real time
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
        // Toggle success message visibility
        setShowSuccessMessage(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
            setFormData({ name: '', email: '', message: '' });
            setShowSuccessMessage(false);
        }, 3000);
    };

    return (
        <div style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ 
                fontSize: '2.5rem', 
                fontFamily: 'var(--font-heading)',
                marginBottom: '12px',
                color: 'var(--on-bg)'
            }}>
                Get In Touch
            </h1>
            <div style={{ 
                width: '60px', 
                height: '3px', 
                backgroundColor: 'var(--primary)', 
                marginBottom: '48px' 
            }}></div>

            {showSuccessMessage && (
                <div style={{
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    padding: '12px 16px',
                    borderRadius: '4px',
                    marginBottom: '24px',
                    border: '1px solid #c3e6cb'
                }}>
                    ✓ Thank you {formData.name}! Your message has been sent successfully.
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label htmlFor="name" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: 'var(--on-bg)'
                    }}>
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '1rem',
                            border: '2px solid var(--primary)',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#16a085'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--primary)'}
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px' }}>
                        Current input: <strong>{formData.name || '(empty)'}</strong>
                    </p>
                </div>

                <div>
                    <label htmlFor="email" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: 'var(--on-bg)'
                    }}>
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '1rem',
                            border: '2px solid var(--primary)',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#16a085'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--primary)'}
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px' }}>
                        Current input: <strong>{formData.email || '(empty)'}</strong>
                    </p>
                </div>

                <div>
                    <label htmlFor="message" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: 'var(--on-bg)'
                    }}>
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Your message here..."
                        rows="5"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '1rem',
                            border: '2px solid var(--primary)',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#16a085'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--primary)'}
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px' }}>
                        Message length: <strong>{formData.message.length} characters</strong>
                    </p>
                </div>

                <button 
                    type="submit"
                    style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s, transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#16a085';
                        e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--primary)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Send Message
                </button>
            </form>

            <div style={{ marginTop: '48px', padding: '24px', backgroundColor: 'var(--bg)', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>Other ways to reach me:</h3>
                <p style={{ color: 'var(--on-bg)', margin: '8px 0' }}>
                    📧 Email: <strong>d25it127@charusat.edu.in</strong>
                </p>
                <p style={{ color: 'var(--on-bg)', margin: '8px 0' }}>
                    💼 LinkedIn: <strong>Kaushal Patel</strong>
                </p>
                <p style={{ color: 'var(--on-bg)', margin: '8px 0' }}>
                    🐙 GitHub: <strong>@kaushalpatel</strong>
                </p>
            </div>
        </div>
    );
}

export default Contact;
