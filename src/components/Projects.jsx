import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const GITHUB_USERNAME = 'octocat';
const REPO_COUNT = 6;

function Projects() {
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        async function loadRepositories() {
            try {
                setLoading(true);
                setError('');

                const response = await fetch(
                    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=${REPO_COUNT}`,
                    {
                        signal: controller.signal,
                        headers: {
                            Accept: 'application/vnd.github+json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Unable to fetch repositories from GitHub.');
                }

                const data = await response.json();
                setRepositories(data);
            } catch (requestError) {
                if (requestError.name !== 'AbortError') {
                    setError(requestError.message || 'Something went wrong while loading repositories.');
                }
            } finally {
                setLoading(false);
            }
        }

        loadRepositories();

        return () => controller.abort();
    }, []);

    return (
        <section className="projects-page">
            <div className="projects-hero clean-panel">
                <div className="projects-kicker">GitHub live feed</div>
                <h1 className="projects-title">Projects</h1>
                <p className="projects-intro">
                    Live repositories from GitHub update automatically when the page loads.
                    Each card highlights the repository name and a direct link to the source.
                </p>
                <div className="projects-stats">
                    <div className="projects-stat">
                        <span className="projects-stat-value">{REPO_COUNT}</span>
                        <span className="projects-stat-label">Repositories shown</span>
                    </div>
                    <div className="projects-stat">
                        <span className="projects-stat-value">Live</span>
                        <span className="projects-stat-label">Fetched from GitHub</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner message="Loading repositories from GitHub..." />
            ) : error ? (
                <ErrorMessage message={error} />
            ) : (
                <div className="projects-grid">
                    {repositories.map((repository) => (
                        <article
                            key={repository.id}
                            className="projects-card clean-panel"
                        >
                            <div className="projects-card-topline" />
                            <div className="projects-card-header">
                                <div>
                                    <p className="projects-card-label">Repository</p>
                                    <h3 className="projects-card-title">{repository.name}</h3>
                                </div>
                                <span className="projects-card-pill">GitHub</span>
                            </div>
                            <p className="projects-card-url-label">Source URL</p>
                            <a
                                href={repository.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="projects-card-link"
                            >
                                {repository.html_url}
                            </a>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default Projects;
