const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');

const router = express.Router();

router.use(authenticate);

router.get('/', getProjects);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').optional().trim(),
  ],
  createProject
);

router.get('/:id', requireProjectMember, getProject);

router.put(
  '/:id',
  requireProjectAdmin,
  [body('name').trim().notEmpty().withMessage('Name is required')],
  updateProject
);

router.delete('/:id', requireProjectAdmin, deleteProject);

router.post(
  '/:id/members',
  requireProjectAdmin,
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  ],
  addMember
);

router.delete('/:id/members/:userId', requireProjectAdmin, removeMember);

module.exports = router;
