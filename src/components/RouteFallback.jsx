import './RouteFallback.css';

function RouteFallback({ message = 'Loading component...' }) {
    return (
        <div 
            className="clean-panel route-fallback-container" 
            role="status" 
            aria-live="polite" 
            aria-busy="true"
        >
            <div className="fallback-spinner" aria-hidden="true" />
            <div className="fallback-text-group">
                <h3 className="fallback-title">{message}</h3>
                <p className="fallback-subtitle">
                    Dynamically fetching code chunk via React.lazy() &amp; Suspense...
                </p>
            </div>
            
            {/* Visual skeleton placeholders simulating incoming content */}
            <div className="skeleton-grid" aria-hidden="true">
                <div className="skeleton-bar skeleton-header" />
                <div className="skeleton-bar skeleton-line-long" />
                <div className="skeleton-bar skeleton-line-medium" />
                <div className="skeleton-bar skeleton-line-short" />
            </div>
        </div>
    );
}

export default RouteFallback;
