const prisma = require('../lib/prisma');

// Require user to be a member of the project (or global admin)
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user.id;

    if (req.user.role === 'ADMIN') return next();

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Access denied: not a project member' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Require user to be a project ADMIN (or global admin)
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user.id;

    if (req.user.role === 'ADMIN') return next();

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: project admin required' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Require global admin role
const requireGlobalAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: global admin required' });
  }
  next();
};

module.exports = { requireProjectMember, requireProjectAdmin, requireGlobalAdmin };
