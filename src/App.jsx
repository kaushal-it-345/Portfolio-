import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Projects from './components/Projects';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import Footer from './components/Footer';

function App() {
    // Supplementary Problem 2: Dark/Light mode toggle state
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-theme');
            document.body.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
            document.body.classList.remove('dark-theme');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <div>
            <Navigation isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/contact" element={<Contact />} />
                    {/* Supplementary Problem 1: 404 Not Found route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer email="d25it127@charusat.edu.in" />
        </div>
    );
}

export default App;