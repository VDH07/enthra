import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim() || nameForm.name.trim() === user.name) return;
    setNameLoading(true);
    try {
      const { user: updated } = await api.updateProfile({ name: nameForm.name.trim() });
      setUser(updated);
      toast.success('Name updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update name');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPassLoading(true);
    try {
      await api.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() || '?';
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{
          background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
          padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
          }}>
            {avatarLetter}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{user?.email}</div>
          </div>
          {user?.role === 'ADMIN' && (
            <span className="badge badge-admin">🛡️ Global Admin</span>
          )}
          <div style={{
            width: '100%', padding: '16px 0 0', borderTop: '1px solid var(--border-light)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Member since</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{joinDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>Role</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {user?.role?.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Update Name */}
          <div style={{
            background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
            padding: 32, boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, fontFamily: 'var(--font-heading)' }}>
              ✏️ Update Name
            </h2>
            <form onSubmit={handleNameUpdate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="profile-name">Display Name</label>
                <input
                  id="profile-name"
                  className="form-input"
                  type="text"
                  value={nameForm.name}
                  onChange={(e) => setNameForm({ name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={nameLoading || !nameForm.name.trim() || nameForm.name.trim() === user?.name}
                style={{ height: 46, marginBottom: 0 }}
              >
                {nameLoading ? 'Saving…' : 'Save'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div style={{
            background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
            padding: 32, boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, fontFamily: 'var(--font-heading)' }}>
              🔒 Change Password
            </h2>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="current-pass">Current Password</label>
                <input
                  id="current-pass"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-pass">New Password</label>
                <input
                  id="new-pass"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-pass">Confirm New Password</label>
                <input
                  id="confirm-pass"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                  required
                  autoComplete="new-password"
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={showPass} onChange={() => setShowPass((v) => !v)} />
                Show passwords
              </label>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={passLoading}
                style={{ alignSelf: 'flex-start' }}
              >
                {passLoading ? 'Changing…' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Account Info */}
          <div style={{
            background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-xl)',
            padding: 32, boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              ℹ️ Account Info
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'User ID', value: user?.id },
                { label: 'Email', value: user?.email },
                { label: 'Role', value: user?.role },
              ].map((row) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '12px 16px',
                  background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 13,
                }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 12 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
