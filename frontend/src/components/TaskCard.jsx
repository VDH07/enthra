const priorityBadge = {
  LOW: 'badge-low',
  MEDIUM: 'badge-medium',
  HIGH: 'badge-high',
};

const statusBadge = {
  TODO: 'badge-todo',
  IN_PROGRESS: 'badge-in-progress',
  DONE: 'badge-done',
};

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, onDragStart, onClick }) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'DONE';

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onClick={() => onClick && onClick(task)}
    >
      <div className="task-card-title">{task.title}</div>
      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}
      <div className="task-card-footer">
        <div className="task-card-meta">
          <span className={`badge ${priorityBadge[task.priority]}`}>
            {task.priority}
          </span>
          {task.assignee && (
            <div className="avatar" style={{ width: 22, height: 22, fontSize: 10 }}>
              {task.assignee.name[0].toUpperCase()}
            </div>
          )}
        </div>
        {task.dueDate && (
          <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            {isOverdue ? '⚠️' : '📅'} {formatDate(task.dueDate)}
          </div>
        )}
      </div>
    </div>
  );
}
