import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
        <div className="navbar-user">
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</span>
          {user.role === 'ADMIN' && (
            <span className="badge badge-admin" style={{ marginLeft: 4 }}>Admin</span>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            style={{ marginLeft: 8 }}
          >
            Sign out
          </button>
        </div>
      </nav>
    </div>
  );
}
