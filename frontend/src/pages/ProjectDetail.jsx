import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import MemberModal from '../components/MemberModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [myRole, setMyRole] = useState('MEMBER');
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null); // { task?: Task, status?: string }
  const [memberModal, setMemberModal] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { project, myRole } = await api.getProject(id);
      setProject(project);
      setTasks(project.tasks);
      setMyRole(myRole);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-project', id);

    const onCreated = ({ task }) => setTasks((prev) => [task, ...prev]);
    const onUpdated = ({ task }) => setTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
    const onDeleted = ({ taskId }) => setTasks((prev) => prev.filter((t) => t.id !== taskId));

    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);

    return () => {
      socket.emit('leave-project', id);
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
    };
  }, [socket, id]);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (err) {
      load(); // revert on failure
    }
  };

  const handleTaskSave = (savedTask, deleted = false) => {
    if (deleted) {
      setTasks((prev) => prev.filter((t) => t.id !== savedTask?.id));
    } else if (savedTask) {
      setTasks((prev) => {
        const exists = prev.find((t) => t.id === savedTask.id);
        return exists ? prev.map((t) => t.id === savedTask.id ? savedTask : t) : [savedTask, ...prev];
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    }
  };

  const isAdmin = myRole === 'ADMIN';

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!project) return null;

  return (
    <div className="page">
      <div className="project-detail-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{project.name}</h1>
            <span className={`badge badge-${myRole.toLowerCase()}`}>{myRole}</span>
          </div>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Created by {project.owner.name} · {project.members.length} member{project.members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {isAdmin && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setMemberModal(true)}>
                👥 Members
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>
                🗑️ Delete
              </button>
            </>
          )}
          {!isAdmin && (
            <button className="btn btn-ghost btn-sm" onClick={() => setMemberModal(true)}>
              👥 Members ({project.members.length})
            </button>
          )}
        </div>
      </div>

      <KanbanBoard
        tasks={tasks}
        onStatusChange={handleStatusChange}
        onAddTask={(status) => setTaskModal({ status })}
        onTaskClick={(task) => setTaskModal({ task })}
        canManage={isAdmin}
      />

      {taskModal && (
        <TaskModal
          projectId={id}
          members={project.members}
          initialStatus={taskModal.status}
          task={taskModal.task}
          onClose={() => setTaskModal(null)}
          onSave={handleTaskSave}
        />
      )}

      {memberModal && (
        <MemberModal
          projectId={id}
          members={project.members}
          onClose={() => setMemberModal(false)}
          onUpdate={load}
        />
      )}
    </div>
  );
}
