import { useState } from 'react';
import { api } from '../api';

export default function MemberModal({ projectId, members, onClose, onUpdate }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.addMember(projectId, { email, role });
      setEmail('');
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.removeMember(projectId, userId);
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">👥 Manage Members</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              className="form-input"
              style={{ flex: 1, minWidth: 160 }}
              type="email"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              className="form-input"
              style={{ width: 110 }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
              {loading ? '…' : 'Add'}
            </button>
          </form>
          <div className="members-list">
            {members.map((m) => (
              <div className="member-row" key={m.userId}>
                <div className="member-info">
                  <div className="avatar">{m.user.name[0].toUpperCase()}</div>
                  <div>
                    <div className="member-name">{m.user.name}</div>
                    <div className="member-email">{m.user.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemove(m.userId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
