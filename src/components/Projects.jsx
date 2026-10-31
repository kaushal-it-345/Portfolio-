import { useEffect, useState, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, BASE_URL } from '../api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import Toast from './Toast';

function Projects() {
    // Core state (Step 3 & 4)
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form inputs state
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter and search state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
    const [priorityFilter, setPriorityFilter] = useState('all');

    // Supplementary Problem 2: Delete confirmation modal state
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Inline edit state
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState('medium');

    // Supplementary Problem 3: Toast notification state
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Load tasks from backend on mount (Step 3)
    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getTasks();
            setTasks(res.data || []);
        } catch (err) {
            setError(err.message || 'Unable to connect to Express/MongoDB backend at http://localhost:5000');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Supplementary Problem 1: Optimistic UI update for task creation
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            showToast('Task title cannot be empty', 'error');
            return;
        }

        const taskPayload = {
            title: newTitle.trim(),
            description: newDescription.trim(),
            priority: newPriority,
            completed: false
        };

        // Temporary optimistic ID
        const tempId = 'optimistic-' + Date.now();
        const optimisticTask = {
            _id: tempId,
            ...taskPayload,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        // 1. Immediately update UI before server responds (Optimistic Update)
        setTasks(prev => [optimisticTask, ...prev]);
        setNewTitle('');
        setNewDescription('');
        setNewPriority('medium');
        setIsSubmitting(true);

        try {
            // 2. Call backend POST /tasks
            const res = await createTask(taskPayload);
            const savedTask = res.data;

            // 3. Replace optimistic task with confirmed task from database
            setTasks(prev => prev.map(t => (t._id === tempId ? savedTask : t)));
            showToast('Task created and saved to MongoDB!', 'success');
        } catch (err) {
            // 4. Revert optimistic task on failure
            setTasks(prev => prev.filter(t => t._id !== tempId));
            showToast(`Creation failed: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle Task Completion (PUT /tasks/:id)
    const handleToggleComplete = async (task) => {
        const originalStatus = task.completed;
        const newStatus = !originalStatus;

        // Optimistic toggle
        setTasks(prev =>
            prev.map(t => (t._id === task._id ? { ...t, completed: newStatus } : t))
        );

        try {
            await updateTask(task._id, { completed: newStatus });
            showToast(`Task marked as ${newStatus ? 'completed' : 'pending'}`, 'success');
        } catch (err) {
            // Revert on error
            setTasks(prev =>
                prev.map(t => (t._id === task._id ? { ...t, completed: originalStatus } : t))
            );
            showToast(`Failed to update status: ${err.message}`, 'error');
        }
    };

    // Save inline edit (PUT /tasks/:id)
    const handleSaveEdit = async (taskId) => {
        if (!editTitle.trim()) {
            showToast('Title cannot be empty', 'error');
            return;
        }

        try {
            const res = await updateTask(taskId, {
                title: editTitle.trim(),
                description: editDescription.trim(),
                priority: editPriority
            });

            setTasks(prev => prev.map(t => (t._id === taskId ? res.data : t)));
            setEditingTaskId(null);
            showToast('Task updated successfully!', 'success');
        } catch (err) {
            showToast(`Update failed: ${err.message}`, 'error');
        }
    };

    // Confirm & Execute Delete (DELETE /tasks/:id)
    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;

        setIsDeleting(true);
        const deletedId = taskToDelete._id;

        try {
            await deleteTask(deletedId);
            setTasks(prev => prev.filter(t => t._id !== deletedId));
            showToast('Task deleted successfully from MongoDB', 'success');
            setTaskToDelete(null);
        } catch (err) {
            showToast(`Delete failed: ${err.message}`, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter logic
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));

        const matchesStatus =
            statusFilter === 'all' ? true :
            statusFilter === 'completed' ? task.completed :
            !task.completed;

        const matchesPriority =
            priorityFilter === 'all' ? true : task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <section className="projects-page">
            {/* Header Hero */}
            <div className="projects-hero clean-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div className="projects-kicker">Full-Stack React + Node + MongoDB</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '0.82rem',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-xl)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            fontWeight: '600',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                            API: {BASE_URL}
                        </span>
                        <button
                            type="button"
                            onClick={loadTasks}
                            disabled={loading}
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

                <h1 className="projects-title">Task Management</h1>
                <p className="projects-intro">
                    Full CRUD client integrated with our Express & MongoDB backend. 
                    Create, update, toggle completion, and delete tasks with real-time UI synchronization, optimistic updates, and schema validation.
                </p>

                <div className="projects-stats">
                    <div className="projects-stat">
                        <span className="projects-stat-value">{tasks.length}</span>
                        <span className="projects-stat-label">Total Tasks</span>
                    </div>
                    <div className="projects-stat">
                        <span className="projects-stat-value">
                            {tasks.filter(t => t.completed).length}
                        </span>
                        <span className="projects-stat-label">Completed</span>
                    </div>
                    <div className="projects-stat">
                        <span className="projects-stat-value">
                            {tasks.filter(t => !t.completed).length}
                        </span>
                        <span className="projects-stat-label">Pending</span>
                    </div>
                </div>
            </div>

            {/* Task Creation Form (Step 4) */}
            <div className="clean-panel" style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', color: 'var(--on-bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>➕</span> Add New Task
                </h2>
                <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', marginBottom: '6px', color: 'var(--on-bg)' }}>
                                Task Title <span style={{ color: 'var(--primary)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Implement full-stack CORS integration"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid var(--surface-border)',
                                    backgroundColor: 'var(--surface)',
                                    color: 'var(--on-bg)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', marginBottom: '6px', color: 'var(--on-bg)' }}>
                                Priority
                            </label>
                            <select
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid var(--surface-border)',
                                    backgroundColor: 'var(--surface)',
                                    color: 'var(--on-bg)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', marginBottom: '6px', color: 'var(--on-bg)' }}>
                            Description (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Brief task notes or acceptance criteria"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1.5px solid var(--surface-border)',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--on-bg)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                padding: '10px 24px',
                                borderRadius: 'var(--radius-xl)',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
                            }}
                        >
                            <span>{isSubmitting ? 'Adding...' : 'Add Task (Optimistic)'}</span>
                            <span>→</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Filter and Search Bar */}
            <div className="clean-panel" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--on-bg)',
                            fontSize: '0.95rem',
                            width: '100%'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Status filter */}
                    <div style={{ display: 'flex', backgroundColor: 'var(--secondary-light)', borderRadius: 'var(--radius-xl)', padding: '2px' }}>
                        {['all', 'pending', 'completed'].map(status => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setStatusFilter(status)}
                                style={{
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: 'var(--radius-xl)',
                                    fontSize: '0.82rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backgroundColor: statusFilter === status ? 'var(--primary)' : 'transparent',
                                    color: statusFilter === status ? 'white' : 'var(--text-muted)'
                                }}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Priority filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-xl)',
                            border: '1px solid var(--surface-border)',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--on-bg)',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Loading / Error / Content */}
            {loading ? (
                <LoadingSpinner message="Connecting to Express backend & fetching tasks from MongoDB..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={loadTasks} />
            ) : filteredTasks.length === 0 ? (
                <div className="clean-panel" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        No tasks found matching your filters.
                    </p>
                    <button
                        type="button"
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); }}
                        className="btn-secondary"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredTasks.map(task => {
                        const isEditing = editingTaskId === task._id;
                        const priorityColors = {
                            high: { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
                            medium: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
                            low: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }
                        };
                        const color = priorityColors[task.priority] || priorityColors.medium;

                        return (
                            <article
                                key={task._id}
                                className="clean-panel"
                                style={{
                                    padding: '20px 24px',
                                    borderLeft: `4px solid ${task.completed ? '#10b981' : color.text}`,
                                    opacity: task.isOptimistic ? 0.75 : 1,
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                {isEditing ? (
                                    /* Inline Edit Mode */
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1.5px solid var(--primary)',
                                                    backgroundColor: 'var(--surface)',
                                                    color: 'var(--on-bg)',
                                                    fontSize: '1rem',
                                                    outline: 'none'
                                                }}
                                            />
                                            <select
                                                value={editPriority}
                                                onChange={(e) => setEditPriority(e.target.value)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1.5px solid var(--surface-border)',
                                                    backgroundColor: 'var(--surface)',
                                                    color: 'var(--on-bg)'
                                                }}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Description"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                border: '1px solid var(--surface-border)',
                                                backgroundColor: 'var(--surface)',
                                                color: 'var(--on-bg)'
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                type="button"
                                                onClick={() => setEditingTaskId(null)}
                                                style={{
                                                    padding: '6px 14px',
                                                    borderRadius: 'var(--radius-xl)',
                                                    border: '1px solid var(--surface-border)',
                                                    backgroundColor: 'transparent',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(task._id)}
                                                style={{
                                                    padding: '6px 16px',
                                                    borderRadius: 'var(--radius-xl)',
                                                    border: 'none',
                                                    backgroundColor: 'var(--primary)',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal Display Mode */
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
                                            {/* Completion Checkbox */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleComplete(task)}
                                                title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
                                                style={{
                                                    marginTop: '3px',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    border: `2px solid ${task.completed ? '#10b981' : 'var(--text-muted)'}`,
                                                    backgroundColor: task.completed ? '#10b981' : 'transparent',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    flexShrink: 0,
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {task.completed && '✓'}
                                            </button>

                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <h3 style={{
                                                        fontSize: '1.2rem',
                                                        margin: 0,
                                                        color: task.completed ? 'var(--text-muted)' : 'var(--on-bg)',
                                                        textDecoration: task.completed ? 'line-through' : 'none'
                                                    }}>
                                                        {task.title}
                                                    </h3>
                                                    {task.isOptimistic && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                                                            (syncing...)
                                                        </span>
                                                    )}
                                                </div>

                                                {task.description && (
                                                    <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: 'var(--radius-xl)',
                                                        backgroundColor: color.bg,
                                                        color: color.text,
                                                        border: `1px solid ${color.border}`,
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {task.priority || 'medium'}
                                                    </span>
                                                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingTaskId(task._id);
                                                    setEditTitle(task.title);
                                                    setEditDescription(task.description || '');
                                                    setEditPriority(task.priority || 'medium');
                                                }}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 'var(--radius-xl)',
                                                    border: '1px solid var(--surface-border)',
                                                    backgroundColor: 'var(--surface)',
                                                    color: 'var(--on-bg)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTaskToDelete(task)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 'var(--radius-xl)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                                    color: '#ef4444',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Supplementary Problem 2: Confirmation Dialog Modal before delete */}
            {taskToDelete && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9990,
                    padding: '16px'
                }}>
                    <div className="clean-panel" style={{
                        maxWidth: '440px',
                        width: '100%',
                        padding: '32px 28px',
                        textAlign: 'center',
                        animation: 'fadeIn 0.2s ease',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ fontSize: '1.35rem', marginBottom: '8px', color: 'var(--on-bg)' }}>
                            Delete Task Confirmation
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                            Are you sure you want to permanently delete &ldquo;<strong>{taskToDelete.title}</strong>&rdquo; from the database? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => setTaskToDelete(null)}
                                disabled={isDeleting}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '1px solid var(--surface-border)',
                                    backgroundColor: 'var(--surface)',
                                    color: 'var(--on-bg)',
                                    fontWeight: '600',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: 'var(--radius-xl)',
                                    border: 'none',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Supplementary Problem 3: Toast Notification Component */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: 'success' })}
            />
        </section>
    );
}

export default Projects;
