const prisma = require('../lib/prisma');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // All tasks assigned to me
    const allTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const todoCount = allTasks.filter((t) => t.status === 'TODO').length;
    const inProgressCount = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const doneCount = allTasks.filter((t) => t.status === 'DONE').length;
    const overdueCount = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    ).length;

    // Recent 10 tasks (all statuses)
    const recentTasks = allTasks.slice(0, 10);

    // My projects
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true } },
          },
        },
      },
      take: 6,
    });

    const projects = memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
    }));

    return res.json({
      stats: {
        total: allTasks.length,
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCount,
        overdue: overdueCount,
      },
      recentTasks,
      projects,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard };
