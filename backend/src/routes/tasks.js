const express = require('express');
const { body } = require('express-validator');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// GET /api/projects/:id/tasks
router.get('/', requireProjectMember, getTasks);

// POST /api/projects/:id/tasks
router.post(
  '/',
  requireProjectMember,
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask
);

// PUT /api/tasks/:id  (standalone route, mounted separately)
// DELETE /api/tasks/:id

module.exports = router;
