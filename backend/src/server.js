const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const { authenticate } = require('./middleware/auth');
const { updateTask, deleteTask } = require('./controllers/taskController');
const { body } = require('express-validator');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:4173',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Standalone task routes (update/delete by task id)
app.put(
  '/api/tasks/:id',
  authenticate,
  [
    body('title').optional().trim().notEmpty(),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  ],
  updateTask
);
app.delete('/api/tasks/:id', authenticate, deleteTask);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  // __dirname = /opt/render/project/src/backend/src
  // frontend/dist is at /opt/render/project/src/frontend/dist
  const frontendDist = path.join(__dirname, '..', '..', '..', 'frontend', 'dist');
  console.log(`Serving static files from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project:${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Enthra server running on port ${PORT}`);
});

module.exports = { app, server };
