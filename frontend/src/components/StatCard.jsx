export default function StatCard({ icon, value, label, color = '#6366f1' }) {
  return (
    <div
      className="stat-card"
      style={{ '--stat-glow': `${color}0d` }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
