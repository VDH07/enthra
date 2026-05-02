const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
};

const getTasks = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ tasks });
  } catch (err) {
    console.error('getTasks error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id: projectId } = req.params;
    const { title, description, priority, dueDate, assigneeId } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: req.user.id,
      },
      include: taskInclude,
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('task:created', { task });

    return res.status(201).json({ task });
  } catch (err) {
    console.error('createTask error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Verify task exists and user has access
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check project membership (Global ADMIN bypasses)
    if (req.user.role !== 'ADMIN') {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: existing.projectId, userId: req.user.id } },
      });
      if (!membership) {
        return res.status(403).json({ message: 'Access denied: not a member of this project' });
      }
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: taskInclude,
    });

    // Emit socket event to project room
    const io = req.app.get('io');
    io.to(`project:${task.projectId}`).emit('task:updated', { task });

    return res.json({ task });
  } catch (err) {
    console.error('updateTask error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check project membership (Global ADMIN bypasses)
    if (req.user.role !== 'ADMIN') {
      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: existing.projectId, userId: req.user.id } },
      });
      if (!membership) {
        return res.status(403).json({ message: 'Access denied: not a member of this project' });
      }
    }

    await prisma.task.delete({ where: { id } });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project:${existing.projectId}`).emit('task:deleted', {
      taskId: id,
      projectId: existing.projectId,
    });

    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
