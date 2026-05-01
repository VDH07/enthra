import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';

const statusBadge = { TODO: 'badge-todo', IN_PROGRESS: 'badge-in-progress', DONE: 'badge-done' };
const priorityBadge = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const d = await api.getDashboard();
      setData(d);
    } catch (err) {
      if (!silent) toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => load(true);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return (
    <div className="page">
      <div className="alert alert-error">Failed to load dashboard data. <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => load()}>Retry</button></div>
    </div>
  );

  const { stats, recentTasks, projects } = data;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()}, {firstName} 👋</h1>
          <p className="page-subtitle">Here's what's happening across your projects</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ gap: 6 }}
        >
          <span style={{ display: 'inline-block', transition: 'transform 0.5s', transform: refreshing ? 'rotate(360deg)' : 'none' }}>
            🔄
          </span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📋" value={stats.total} label="Total Tasks" color="#818cf8" />
        <StatCard icon="⭕" value={stats.todo} label="To Do" color="#94a3b8" />
        <StatCard icon="⚡" value={stats.inProgress} label="In Progress" color="#06b6d4" />
        <StatCard icon="✅" value={stats.done} label="Completed" color="#10b981" />
        <StatCard icon="🔥" value={stats.overdue} label="Overdue" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        {/* Recent Tasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>📋 My Recent Tasks</h2>
            {recentTasks.length > 0 && (
              <Link to="/projects" className="btn btn-ghost btn-sm">View projects</Link>
            )}
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
                      <tr key={t.id} className="task-row">
                        <td style={{ fontWeight: 600, maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.title}
                          </div>
                        </td>
                        <td>
                          <Link
                            to={`/projects/${t.project.id}`}
                            style={{ color: 'var(--color-primary-light)', fontWeight: 500, fontSize: 13 }}
                          >
                            {t.project.name}
                          </Link>
                        </td>
                        <td><span className={`badge ${statusBadge[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                        <td><span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                        <td style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
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

        {/* My Projects */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>📁 My Projects</h2>
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
              projects.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  style={{
                    display: 'block', padding: 16, borderRadius: 14,
                    background: '#fff', border: '1px solid var(--border-strong)',
                    transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)',
                    borderLeft: `4px solid ${COLORS[i % COLORS.length]}`,
                    textDecoration: 'none',
                  }}
                  className="project-card-link"
                >
                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)', fontSize: 14 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span>📋 {p._count.tasks} tasks</span>
                    <span className={`badge badge-${p.myRole.toLowerCase()}`} style={{ padding: '2px 8px', fontSize: 10 }}>
                      {p.myRole}
                    </span>
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
