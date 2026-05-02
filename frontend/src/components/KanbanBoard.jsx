import { useRef } from 'react';
import TaskCard from './TaskCard';

const COLUMNS = [
  { key: 'TODO', label: 'To Do', color: '#94a3b8' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#06b6d4' },
  { key: 'DONE', label: 'Done', color: '#10b981' },
];

export default function KanbanBoard({ tasks, onStatusChange, onAddTask, onTaskClick, canManage }) {
  const dragTask = useRef(null);

  const handleDragStart = (e, task) => {
    dragTask.current = task;
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e, colEl) => {
    e.preventDefault();
    colEl.classList.add('drag-over');
  };

  const handleDragLeave = (e, colEl) => {
    colEl.classList.remove('drag-over');
  };

  const handleDrop = (e, status, colEl) => {
    e.preventDefault();
    colEl.classList.remove('drag-over');
    if (dragTask.current && dragTask.current.status !== status) {
      onStatusChange(dragTask.current.id, status);
    }
    dragTask.current = null;
  };

  const colRefs = useRef({});

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            className="kanban-column"
            ref={(el) => (colRefs.current[col.key] = el)}
            onDragOver={(e) => handleDragOver(e, colRefs.current[col.key])}
            onDragLeave={(e) => handleDragLeave(e, colRefs.current[col.key])}
            onDrop={(e) => handleDrop(e, col.key, colRefs.current[col.key])}
          >
            <div className="kanban-col-header">
              <span className="kanban-col-title" style={{ color: col.color }}>
                {col.label}
              </span>
              <span className="kanban-count">{colTasks.length}</span>
            </div>
            <div className="kanban-tasks">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={onTaskClick}
                />
              ))}
            </div>
            {canManage && (
              <button
                className="add-task-btn"
                onClick={() => onAddTask(col.key)}
              >
                + Add task
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
