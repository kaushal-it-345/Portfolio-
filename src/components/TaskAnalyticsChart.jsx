import { useMemo, useState } from 'react';

function TaskAnalyticsChart({ tasks = [] }) {
    const [selectedMetric, setSelectedMetric] = useState('priority');

    // Aggregate statistics
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const high = tasks.filter(t => t.priority === 'high').length;
        const medium = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            pending,
            high,
            medium,
            low,
            completionRate
        };
    }, [tasks]);

    return (
        <div 
            className="clean-panel" 
            style={{
                marginTop: '24px',
                border: '1px solid var(--surface-border)',
                background: 'linear-gradient(180deg, var(--surface) 0%, rgba(20, 184, 166, 0.03) 100%)',
                animation: 'fadeIn 0.4s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--on-bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📊</span> Task Performance &amp; Analytics
                        <span style={{ 
                            fontSize: '0.72rem', 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            background: 'var(--accent-light)', 
                            color: 'var(--primary)',
                            fontWeight: 600,
                            letterSpacing: '0.04em'
                        }}>
                            LAZY LOADED CHUNK
                        </span>
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Heavy analytical component loaded on-demand via dynamic chunk splitting
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={() => setSelectedMetric('priority')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid var(--surface-border)',
                            background: selectedMetric === 'priority' ? 'var(--primary)' : 'var(--surface)',
                            color: selectedMetric === 'priority' ? '#ffffff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Priority Breakdown
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedMetric('status')}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid var(--surface-border)',
                            background: selectedMetric === 'status' ? 'var(--primary)' : 'var(--surface)',
                            color: selectedMetric === 'status' ? '#ffffff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Completion Velocity
                    </button>
                </div>
            </div>

            {/* Interactive SVG / Metric Visualizer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                {/* Metric Card 1 */}
                <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg)',
                    border: '1px solid var(--surface-border)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Completion Rate
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', margin: '8px 0' }}>
                        {stats.completionRate}%
                    </div>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(64, 89, 170, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${stats.completionRate}%`,
                            height: '100%',
                            background: 'var(--primary)',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg)',
                    border: '1px solid var(--surface-border)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Pending Workload
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b', margin: '8px 0' }}>
                        {stats.pending} / {stats.total}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {stats.completed} tasks fulfilled
                    </div>
                </div>

                {/* Metric Card 3 */}
                <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg)',
                    border: '1px solid var(--surface-border)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Critical / High Priority
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444', margin: '8px 0' }}>
                        {stats.high}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Needs immediate attention
                    </div>
                </div>
            </div>

            {/* SVG Visual Chart */}
            <div style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg)',
                border: '1px solid var(--surface-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {selectedMetric === 'priority' ? (
                    <div style={{ width: '100%', maxWidth: '460px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--on-bg)' }}>
                            <span>High: <strong>{stats.high}</strong></span>
                            <span>Medium: <strong>{stats.medium}</strong></span>
                            <span>Low: <strong>{stats.low}</strong></span>
                        </div>
                        <div style={{ display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%`, background: '#ef4444', transition: 'width 0.4s ease' }} title={`High: ${stats.high}`} />
                            <div style={{ width: `${stats.total > 0 ? (stats.medium / stats.total) * 100 : 0}%`, background: '#f59e0b', transition: 'width 0.4s ease' }} title={`Medium: ${stats.medium}`} />
                            <div style={{ width: `${stats.total > 0 ? (stats.low / stats.total) * 100 : 0}%`, background: '#10b981', transition: 'width 0.4s ease' }} title={`Low: ${stats.low}`} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> High Priority
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} /> Medium Priority
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} /> Low Priority
                            </span>
                        </div>
                    </div>
                ) : (
                    <div style={{ width: '100%', maxWidth: '460px', textAlign: 'center' }}>
                        <svg viewBox="0 0 120 70" style={{ width: '160px', margin: '0 auto' }}>
                            <path
                                d="M 15 60 A 45 45 0 0 1 105 60"
                                fill="none"
                                stroke="rgba(64, 89, 170, 0.12)"
                                strokeWidth="12"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 15 60 A 45 45 0 0 1 105 60"
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray="141.37"
                                strokeDashoffset={141.37 - (141.37 * (stats.completionRate / 100))}
                                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                            />
                            <text x="60" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--on-bg)">
                                {stats.completionRate}%
                            </text>
                        </svg>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {stats.completed} of {stats.total} tasks completed
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskAnalyticsChart;
