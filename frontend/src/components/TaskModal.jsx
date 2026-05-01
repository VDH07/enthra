import { useState } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskModal({ projectId, members, initialStatus, task, onClose, onSave, canManage = false }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    status: task?.status || initialStatus || 'TODO',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    assigneeId: task?.assigneeId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const isViewOnly = !!task && !canManage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) { onClose(); return; }
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      };
      let saved;
      if (task) {
        const { task: updated } = await api.updateTask(task.id, payload);
        saved = updated;
      } else {
        const { task: created } = await api.createTask(projectId, payload);
        saved = { ...created, _new: true };
      }
      onSave(saved);
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await api.deleteTask(task.id);
      onSave(task, true);
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {isViewOnly ? '👁️ Task Details' : task ? '✏️ Edit Task' : '➕ New Task'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {isOverdue && (
              <div className="alert alert-warning">⚠️ This task is overdue!</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                className="form-input"
                value={form.title}
                onChange={set('title')}
                required
                placeholder="Task title"
                readOnly={isViewOnly}
                style={isViewOnly ? { background: 'var(--bg-secondary)', cursor: 'default' } : {}}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-input"
                value={form.description}
                onChange={set('description')}
                placeholder="Optional details…"
                readOnly={isViewOnly}
                style={isViewOnly ? { background: 'var(--bg-secondary)', cursor: 'default' } : {}}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="form-input"
                  value={form.priority}
                  onChange={set('priority')}
                  disabled={isViewOnly}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="form-input"
                  value={form.status}
                  onChange={set('status')}
                  disabled={isViewOnly}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-due">Due Date</label>
                <input
                  id="task-due"
                  className="form-input"
                  type="date"
                  value={form.dueDate}
                  onChange={set('dueDate')}
                  disabled={isViewOnly}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee">Assignee</label>
                <select
                  id="task-assignee"
                  className="form-input"
                  value={form.assigneeId}
                  onChange={set('assigneeId')}
                  disabled={isViewOnly}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {task && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16 }}>
                <span>Created by: {task.creator?.name || 'Unknown'}</span>
                {task.updatedAt && (
                  <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            {task && canManage && (
              <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
                🗑️ Delete
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? 'Saving…' : task ? 'Update' : 'Create'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
