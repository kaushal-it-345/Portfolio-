import { useEffect, useState, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const DEFAULT_USERNAME = 'octocat';
const REPO_COUNT = 9;

function Projects() {
    // Step 1: 3 core state variables for data, loading, and error
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Supplementary Problem: Search/filter state
    const [searchTerm, setSearchTerm] = useState('');

    // State to simulate broken API URL for lab demonstration
    const [simulateError, setSimulateError] = useState(false);

    // Step 2: Fetch function (reusable for initial mount & retry button)
    const fetchRepositories = useCallback(async (shouldFail = false) => {
        try {
            setLoading(true);
            setError(null);

            // If simulateError is active or requested, use an invalid URL to trigger error path
            const targetUrl = shouldFail
                ? 'https://api.github.com/users/non-existent-user-error-simulation-404/repos'
                : `https://api.github.com/users/${DEFAULT_USERNAME}/repos?sort=updated&per_page=${REPO_COUNT}`;

            const response = await fetch(targetUrl, {
                headers: {
                    Accept: 'application/vnd.github+json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('GitHub API Error (404): Target user or repositories not found.');
                } else if (response.status === 403) {
                    throw new Error('GitHub API rate limit exceeded. Please try again later.');
                }
                throw new Error(`Unable to fetch repositories (HTTP status: ${response.status}).`);
            }

            const data = await response.json();
            setRepositories(data);
            setSimulateError(false);
        } catch (err) {
            setError(err.message || 'Something went wrong while loading repositories.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Step 2: Trigger fetch on mount with empty dependency array []
    useEffect(() => {
        fetchRepositories();
    }, [fetchRepositories]);

    // Supplementary Problem: Filter repositories by name
    const filteredRepositories = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    return (
        <section className="projects-page">
            {/* Header Hero */}
            <div className="projects-hero clean-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div className="projects-kicker">GitHub Live REST API</div>
                    
                    {/* Faculty Demonstration Helper: Break API URL / Refresh */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => {
                                const nextState = !simulateError;
                                setSimulateError(nextState);
                                fetchRepositories(nextState);
                            }}
                            title="Faculty testing: Break API URL to test error and retry states"
                            style={{
                                fontSize: '0.82rem',
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-xl)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                backgroundColor: simulateError ? '#ef4444' : 'rgba(239, 68, 68, 0.08)',
                                color: simulateError ? 'white' : '#ef4444',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {simulateError ? '⚠️ Error Mode Active' : '⚡ Simulate API Error'}
                        </button>
                        <button
                            type="button"
                            onClick={() => fetchRepositories(false)}
                            disabled={loading}
                            title="Re-fetch repositories from GitHub"
                            style={{
                                fontSize: '0.82rem',
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-xl)',
                                border: '1px solid var(--surface-border)',
                                backgroundColor: 'var(--secondary-light)',
                                color: 'var(--secondary)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span>🔄</span>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                <h1 className="projects-title">Projects Showcase</h1>
                <p className="projects-intro">
                    Dynamic projects consumed asynchronously from GitHub's public REST API 
                    (<code>https://api.github.com/users/{DEFAULT_USERNAME}/repos</code>) using <code>fetch</code> and <code>useEffect</code>.
                </p>

                <div className="projects-stats">
                    <div className="projects-stat">
                        <span className="projects-stat-value">{repositories.length}</span>
                        <span className="projects-stat-label">Fetched Repositories</span>
                    </div>
                    <div className="projects-stat">
                        <span className="projects-stat-value">{filteredRepositories.length}</span>
                        <span className="projects-stat-label">Matching Repositories</span>
                    </div>
                    <div className="projects-stat">
                        <span className="projects-stat-value">REST API</span>
                        <span className="projects-stat-label">GitHub v3 Endpoint</span>
                    </div>
                </div>
            </div>

            {/* Step 3: Conditional Rendering Based on State */}
            {loading ? (
                // State: Loading
                <LoadingSpinner message="Fetching repositories from GitHub API..." />
            ) : error ? (
                // State: Error with Supplementary Problem: Retry Button
                <ErrorMessage 
                    message={error} 
                    onRetry={() => {
                        setSimulateError(false);
                        fetchRepositories(false);
                    }} 
                />
            ) : (
                // State: Success
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Supplementary Problem: Search/Filter Input */}
                    <div 
                        className="clean-panel" 
                        style={{ 
                            padding: '16px 20px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            gap: '16px',
                            flexWrap: 'wrap'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Filter repositories by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    fontSize: '0.98rem',
                                    color: 'var(--on-bg)',
                                    fontFamily: 'inherit'
                                }}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        padding: '4px'
                                    }}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: '600', 
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--accent-light)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-xl)'
                        }}>
                            Showing {filteredRepositories.length} of {repositories.length}
                        </span>
                    </div>

                    {/* Step 4: Map over repos array */}
                    {filteredRepositories.length === 0 ? (
                        <div className="clean-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                                No repositories found matching &ldquo;<strong>{searchTerm}</strong>&rdquo;.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="btn-secondary"
                            >
                                Clear Search Filter
                            </button>
                        </div>
                    ) : (
                        <div className="projects-grid">
                            {filteredRepositories.map((repository) => (
                                <article
                                    key={repository.id}
                                    className="projects-card clean-panel"
                                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                                >
                                    <div>
                                        <div className="projects-card-topline" />
                                        <div className="projects-card-header">
                                            <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                                                <p className="projects-card-label">Repository</p>
                                                {/* Supplementary Problem: Display star count alongside name */}
                                                <h3 className="projects-card-title" style={{ wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span>{repository.name}</span>
                                                    <span 
                                                        title={`${repository.stargazers_count} GitHub stars`}
                                                        style={{
                                                            fontSize: '0.78rem',
                                                            fontWeight: '700',
                                                            backgroundColor: 'rgba(234, 179, 8, 0.15)',
                                                            color: '#b45309',
                                                            border: '1px solid rgba(234, 179, 8, 0.3)',
                                                            padding: '2px 8px',
                                                            borderRadius: 'var(--radius-xl)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <span>⭐</span>
                                                        <span>{repository.stargazers_count}</span>
                                                    </span>
                                                </h3>
                                            </div>
                                            <span className="projects-card-pill">
                                                {repository.language || 'Public'}
                                            </span>
                                        </div>

                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)',
                                            lineHeight: '1.5',
                                            margin: '0 0 16px',
                                            minHeight: '40px'
                                        }}>
                                            {repository.description || 'Public GitHub repository showcase.'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="projects-card-url-label">Repository URL</p>
                                        <a
                                            href={repository.html_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="projects-card-link"
                                        >
                                            {repository.html_url}
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default Projects;
