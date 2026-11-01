import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import RouteFallback from './components/RouteFallback';
import { lazyWithDelay } from './utils/lazyWithDelay';

// Practical 8: Route-based code splitting using React.lazy()
// Supplementary Problem 2: 300ms minimum delay fallback to prevent flickering loading state on fast connections
const Home = lazyWithDelay(() => import('./components/Home'), 300);
const Projects = lazyWithDelay(() => import('./components/Projects'), 300);
const Contact = lazyWithDelay(() => import('./components/Contact'), 300);
const NotFound = lazy(() => import('./components/NotFound'));


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
                {/* Practical 8: Suspense boundary wrapping Route components with meaningful fallback UI */}
                <Suspense fallback={<RouteFallback message="Loading page..." />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/tasks" element={<Projects />} />
                        <Route path="/contact" element={<Contact />} />
                        {/* Supplementary Problem 1: 404 Not Found route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
            <Footer email="d25it127@charusat.edu.in" />
        </div>
    );
}

export default App;