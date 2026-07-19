import { Link } from 'react-router-dom';
import { useState } from 'react';

function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav style={{
            backgroundColor: 'var(--primary)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'var(--font-heading)'
            }}>
                Portfolio
            </div>
            
            <button 
                onClick={toggleMenu}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'none'
                }}
                className="menu-toggle"
            >
                ☰
            </button>

            <ul style={{
                display: isMenuOpen ? 'flex' : 'flex',
                listStyle: 'none',
                margin: 0,
                padding: 0,
                gap: '24px',
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <li>
                    <Link 
                        to="/" 
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: '500',
                            transition: 'opacity 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        Home
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/projects" 
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: '500',
                            transition: 'opacity 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        Projects
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/contact" 
                        style={{
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: '500',
                            transition: 'opacity 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        Contact
                    </Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;
