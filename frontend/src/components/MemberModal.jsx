import { useState } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

export default function MemberModal({ projectId, members, onClose, onUpdate, canManage = false }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.addMember(projectId, { email, role });
      setEmail('');
      toast.success(`${email} added to project!`);
      onUpdate();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId, name) => {
    if (!confirm(`Remove ${name} from this project?`)) return;
    setRemoveLoading(userId);
    try {
      await api.removeMember(projectId, userId);
      toast.success(`${name} removed from project`);
      onUpdate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoveLoading(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">👥 {canManage ? 'Manage Members' : 'Team Members'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {/* Add member form (admin only) */}
          {canManage && (
            <form onSubmit={handleAdd}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  className="form-input"
                  style={{ flex: 1, minWidth: 160 }}
                  type="email"
                  placeholder="user@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <select
                  className="form-input"
                  style={{ width: 120 }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
                  {loading ? '…' : '+ Add'}
                </button>
              </div>
            </form>
          )}

          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </div>

          <div className="members-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m) => (
              <div className="member-row" key={m.userId}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                    {m.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {m.user.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                  {canManage && m.role !== 'ADMIN' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(m.userId, m.user.name)}
                      disabled={removeLoading === m.userId}
                      style={{ padding: '4px 10px' }}
                    >
                      {removeLoading === m.userId ? '…' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
