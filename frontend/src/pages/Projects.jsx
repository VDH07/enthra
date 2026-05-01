import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    api.getProjects()
      .then(({ projects }) => setProjects(projects))
      .catch((err) => toast.error(err.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setFormLoading(true);
    try {
      await api.createProject({ name: form.name.trim(), description: form.description.trim() });
      setForm({ name: '', description: '' });
      setShowForm(false);
      toast.success(`Project "${form.name.trim()}" created!`);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">📁 Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Project
        </button>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <input
            className="form-input"
            type="search"
            placeholder="🔍 Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">🚀 New Project</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-name">Project Name *</label>
                  <input
                    id="proj-name"
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="My Awesome Project"
                    required
                    autoFocus
                    maxLength={80}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                    {form.name.length}/80
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-desc">Description</label>
                  <textarea
                    id="proj-desc"
                    className="form-input"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What is this project about?"
                    maxLength={300}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                    {form.description.length}/300
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={formLoading || !form.name.trim()}>
                  {formLoading ? 'Creating…' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 && search ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2 className="empty-title">No results</h2>
          <p className="empty-desc">No projects match "{search}"</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear search</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2 className="empty-title">No projects yet</h2>
          <p className="empty-desc">Create your first project or ask to be added to an existing one</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            const completedTasks = p._count?.tasks || 0;
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="project-card">
                <div style={{
                  height: 6, borderRadius: '3px 3px 0 0', background: color,
                  margin: '-32px -32px 24px', borderTopLeftRadius: 'var(--radius-xl)',
                  borderTopRightRadius: 'var(--radius-xl)',
                }} />
                <div className="project-card-name">{p.name}</div>
                <div className="project-card-desc">{p.description || 'No description provided'}</div>
                <div className="project-card-footer">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="meta-item">
                      <span>👥</span> {p.members.length} member{p.members.length !== 1 ? 's' : ''}
                    </span>
                    <span className="meta-item">
                      <span>📋</span> {completedTasks} task{completedTasks !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className={`badge badge-${p.myRole.toLowerCase()}`}>{p.myRole}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
