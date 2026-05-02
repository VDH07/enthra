import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🚀', title: 'Project Management', desc: 'Create projects, invite your team, and track everything in one beautiful workspace.' },
  { icon: '🎯', title: 'Kanban Boards', desc: 'Drag-and-drop tasks across Todo, In Progress, and Done columns in real time.' },
  { icon: '⚡', title: 'Real-time Sync', desc: 'See task updates instantly across all team members — powered by WebSockets.' },
  { icon: '🔐', title: 'Role-Based Access', desc: 'Assign Admin or Member roles per project for fine-grained access control.' },
  { icon: '📊', title: 'Smart Dashboard', desc: 'Get a bird\'s-eye view of your tasks, overdue items, and project health.' },
  { icon: '🌐', title: 'Cloud Deployed', desc: 'Hosted on Railway with PostgreSQL for fast, reliable access anywhere.' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <div className="navbar-container">
        <nav className="navbar">
          <span className="navbar-logo">Enthra</span>
          <div className="navbar-links">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get started free</Link>
              </>
            )}
          </div>
        </nav>
      </div>

      <section className="hero">
        <div className="hero-badge">✨ Real-time collaboration, built for teams</div>
        <h1 className="hero-title">
          Manage projects.<br />
          <span className="gradient-text">Ship faster together.</span>
        </h1>
        <p className="hero-desc">
          Enthra gives your team a beautiful Kanban board, role-based access, and live task
          updates — everything you need to stay aligned and deliver on time.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
            🚀 Start for free
          </Link>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: 15 }}>
            Sign in
          </Link>
        </div>

        <div className="hero-preview" style={{ marginTop: 80, width: '100%', maxWidth: 900, animation: 'slideUp 1s ease 0.4s both' }}>
          <div className="kanban-board" style={{ pointerEvents: 'none' }}>
            {['To Do', 'In Progress', 'Done'].map((col, i) => (
              <div key={col} className="kanban-column" style={{ minHeight: 300 }}>
                <div className="kanban-col-header">
                  <div className="kanban-col-title">{col}</div>
                </div>
                <div className="kanban-tasks">
                  {[1,2].map((n) => (
                    <div key={n} className="task-card">
                      <div className="task-card-title">Sample task {n}</div>
                      <div className="task-card-footer">
                        <span className="badge badge-medium">MEDIUM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="features-title">Everything your team needs</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p>Built with ❤️ using React, Express, Prisma & Socket.io · Deployed on Railway</p>
      </footer>
    </div>
  );
}
