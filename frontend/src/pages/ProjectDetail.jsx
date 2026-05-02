import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import MemberModal from '../components/MemberModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [myRole, setMyRole] = useState('MEMBER');
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const { project, myRole } = await api.getProject(id);
      setProject(project);
      setTasks(project.tasks);
      setMyRole(myRole);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-project', id);

    const onCreated = ({ task }) => {
      setTasks((prev) => [task, ...prev]);
      if (task.creatorId !== user?.id) {
        toast.info(`New task added: "${task.title}"`);
      }
    };
    const onUpdated = ({ task }) => {
      setTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
    };
    const onDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);

    socket.on('member:added', ({ membership }) => {
      setProject((prev) => prev ? { ...prev, members: [...prev.members, membership] } : prev);
      toast.info(`${membership.user.name} joined the project`);
    });
    socket.on('member:removed', ({ userId }) => {
      setProject((prev) => {
        if (!prev) return prev;
        const members = prev.members.filter((m) => m.userId !== userId);
        return { ...prev, members };
      });
      if (userId === user?.id) {
        toast.warning('You have been removed from this project');
        navigate('/projects');
      }
    });
    return () => {
      socket.emit('leave-project', id);
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
      socket.off('member:added');
      socket.off('member:removed');
    };
  }, [socket, id, user, toast]);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (err) {
      toast.error('Failed to update task status');
      load();
    }
  };

  const handleTaskSave = (savedTask, deleted = false) => {
    if (deleted) {
      setTasks((prev) => prev.filter((t) => t.id !== savedTask?.id));
      toast.success('Task deleted');
    } else if (savedTask) {
      setTasks((prev) => {
        const exists = prev.find((t) => t.id === savedTask.id);
        return exists
          ? prev.map((t) => t.id === savedTask.id ? savedTask : t)
          : [savedTask, ...prev];
      });
      toast.success(savedTask._new ? 'Task created!' : 'Task updated!');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProject(id);
      toast.success(`Project "${project.name}" deleted`);
      navigate('/projects');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    setEditLoading(true);
    try {
      const { project: updated } = await api.updateProject(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      setProject(updated);
      setEditModal(false);
      toast.success('Project updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({ name: project.name, description: project.description || '' });
    setEditModal(true);
  };

  const isAdmin = myRole === 'ADMIN';

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const taskStats = {
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (error) return (
    <div className="page">
      <div className="alert alert-error">❌ {error}</div>
      <Link to="/projects" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>← Back to Projects</Link>
    </div>
  );
  if (!project) return null;

  return (
    <div className="page">
      {/* Project Header */}
      <div className="project-detail-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Link to="/projects" style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
              ← Projects
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{project.name}</h1>
            <span className={`badge badge-${myRole.toLowerCase()}`}>{myRole}</span>
          </div>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Created by {project.owner.name} · {project.members.length} member{project.members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setMemberModal(true)}>
            👥 Members ({project.members.length})
          </button>
          {isAdmin && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={openEditModal}>
                ✏️ Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'To Do', value: taskStats.todo, color: '#94a3b8' },
          { label: 'In Progress', value: taskStats.inProgress, color: '#06b6d4' },
          { label: 'Done', value: taskStats.done, color: '#10b981' },
          { label: 'Total', value: tasks.length, color: '#4f46e5' },
        ].map((s) => (
          <div key={s.label} style={{
            padding: '10px 20px', background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>
              {s.value}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          type="search"
          placeholder="🔍 Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 220, height: 40 }}
        />
        <select
          className="form-input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ maxWidth: 150, height: 40 }}
        >
          <option value="ALL">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <select
          className="form-input"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{ maxWidth: 150, height: 40 }}
        >
          <option value="ALL">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button
            className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('kanban')}
          >
            ⬛ Kanban
          </button>
          <button
            className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('list')}
          >
            ☰ List
          </button>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setTaskModal({ status: 'TODO' })}>
            + Add Task
          </button>
        )}
      </div>

      {view === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onAddTask={(status) => isAdmin && setTaskModal({ status })}
          onTaskClick={(task) => setTaskModal({ task })}
          canManage={isAdmin}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          onTaskClick={(task) => setTaskModal({ task })}
        />
      )}

      {taskModal && (
        <TaskModal
          projectId={id}
          members={project.members}
          initialStatus={taskModal.status}
          task={taskModal.task}
          onClose={() => setTaskModal(null)}
          onSave={handleTaskSave}
          canManage={isAdmin}
        />
      )}

      {memberModal && (
        <MemberModal
          projectId={id}
          members={project.members}
          onClose={() => setMemberModal(false)}
          onUpdate={load}
          canManage={isAdmin}
        />
      )}

      {/* Edit Project Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">✏️ Edit Project</h2>
              <button className="modal-close" onClick={() => setEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditProject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-proj-name">Project Name *</label>
                  <input
                    id="edit-proj-name"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    autoFocus
                    maxLength={80}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-proj-desc">Description</label>
                  <textarea
                    id="edit-proj-desc"
                    className="form-input"
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Project description…"
                    maxLength={300}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={editLoading || !editForm.name.trim()}>
                  {editLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const statusBadge = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' };
const priorityBadge = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TaskListView({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No tasks found</div>
        <div className="empty-desc">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
            return (
              <tr
                key={t.id}
                onClick={() => onTaskClick(t)}
                style={{ cursor: 'pointer' }}
                className="task-row"
              >
                <td style={{ fontWeight: 600, maxWidth: 260 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </div>
                  {t.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
                      {t.description.slice(0, 60)}{t.description.length > 60 ? '…' : ''}
                    </div>
                  )}
                </td>
                <td><span className={`badge ${statusBadge[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                <td><span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {t.assignee ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#fff',
                      }}>
                        {t.assignee.name?.[0]?.toUpperCase()}
                      </div>
                      {t.assignee.name}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>
                      (Unassigned)
                    </span>
                  )}
                </td>
                <td style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
                  {isOverdue ? '⚠️ ' : ''}{formatDate(t.dueDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
