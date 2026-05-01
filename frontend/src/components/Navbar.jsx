import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-logo">Enthra</Link>

        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/projects"
            className={`navbar-link ${isActive('/projects') ? 'active' : ''}`}
          >
            📁 Projects
          </Link>
        </div>

        <div className="navbar-user" ref={menuRef} style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setMenuOpen((v) => !v)}>
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{user.email}</span>
          </div>
          {user.role === 'ADMIN' && (
            <span className="badge badge-admin" style={{ marginLeft: 2, fontSize: 10 }}>Admin</span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
            {menuOpen ? '▲' : '▼'}
          </span>

          {menuOpen && (
            <div className="user-dropdown">
              <Link
                to="/profile"
                className="user-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                👤 My Profile
              </Link>
              <Link
                to="/projects"
                className="user-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                📁 My Projects
              </Link>
              <div className="user-dropdown-divider" />
              <button className="user-dropdown-item user-dropdown-danger" onClick={handleLogout}>
                🚪 Sign out
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
