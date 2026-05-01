import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

const statusBadge = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' };
const priorityBadge = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, recentTasks, projects } = data;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Good day, {user.name.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening across your projects</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="📋" value={stats.total} label="Total Tasks" color="#818cf8" />
        <StatCard icon="⭕" value={stats.todo} label="To Do" color="#94a3b8" />
        <StatCard icon="⚡" value={stats.inProgress} label="In Progress" color="#06b6d4" />
        <StatCard icon="✅" value={stats.done} label="Completed" color="#10b981" />
        <StatCard icon="🔥" value={stats.overdue} label="Overdue" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No tasks yet</div>
              <div className="empty-desc">Tasks assigned to you will appear here</div>
              <Link to="/projects" className="btn btn-primary btn-sm">Browse Projects</Link>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((t) => {
                    const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
                    return (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600, maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.title}
                          </div>
                        </td>
                        <td>
                          <Link to={`/projects/${t.project.id}`} style={{ color: 'var(--color-primary-light)', fontWeight: 500 }}>
                            {t.project.name}
                          </Link>
                        </td>
                        <td><span className={`badge ${statusBadge[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                        <td><span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                        <td style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                          {isOverdue ? '⚠️ ' : ''}{formatDate(t.dueDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Projects</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-icon">📁</div>
                <div className="empty-title">No projects</div>
                <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Create one</Link>
              </div>
            ) : (
              projects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  style={{ display: 'block', padding: 16, borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', transition: 'var(--transition)' }}
                  className="project-card-link"
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                    <span>📋 {p._count.tasks} tasks</span>
                    <span className={`badge badge-${p.myRole.toLowerCase()}`}>{p.myRole}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
