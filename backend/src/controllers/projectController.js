const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            _count: { select: { tasks: true } },
          },
        },
      },
    });

    const projects = memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
    }));

    return res.json({ projects });
  } catch (err) {
    console.error('getProjects error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description } = req.body;
    const ownerId = req.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId,
        members: {
          create: { userId: ownerId, role: 'ADMIN' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return res.status(201).json({ project });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Attach caller's role
    const myMembership = project.members.find((m) => m.userId === req.user.id);
    const myRole = req.user.role === 'ADMIN' ? 'ADMIN' : myMembership?.role || null;

    return res.json({ project, myRole });
  } catch (err) {
    console.error('getProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return res.json({ project });
  } catch (err) {
    console.error('updateProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const addMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id: projectId } = req.params;
    const { email, role = 'MEMBER' } = req.body;

    const userToAdd = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });
    if (existing) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    const membership = await prisma.projectMember.create({
      data: { projectId, userId: userToAdd.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('member:added', { membership });
    return res.status(201).json({ membership });
  } catch (err) {
    console.error('addMember error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    // Cannot remove project owner
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project?.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('member:removed', { userId });
    return res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('removeMember error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
