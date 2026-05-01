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
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,17,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Enthra</span>
        <div style={{ display: 'flex', gap: 10 }}>
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
          <Link to="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
            🚀 Start for free
          </Link>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '13px 28px', fontSize: 15 }}>
            Sign in
          </Link>
        </div>

        <div className="hero-preview" style={{ marginTop: 64 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {['To Do', 'In Progress', 'Done'].map((col, i) => (
              <div key={col} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, color: ['#94a3b8','#06b6d4','#10b981'][i] }}>{col}</div>
                {[1,2].map((n) => (
                  <div key={n} style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Sample task {n}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 600 }}>MEDIUM</span>
                    </div>
                  </div>
                ))}
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
