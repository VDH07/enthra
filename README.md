# Enthra — Project & Task Management

A full-stack project management app with real-time collaboration, drag-and-drop Kanban boards, and role-based access control.

## Tech Stack
- **Frontend**: React + Vite, Vanilla CSS, Socket.io-client
- **Backend**: Node.js + Express, Prisma ORM, Socket.io
- **Database**: PostgreSQL
- **Auth**: JWT
- **Deploy**: Railway

## Local Setup

### 1. Clone and install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Database setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Run dev servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001

---

## Railway Deployment

### 1. Create Railway account at railway.app

### 2. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 3. Deploy Backend
```bash
cd backend
railway init
railway add postgresql   # adds PostgreSQL plugin
railway variables set JWT_SECRET=your-secret-here
railway variables set FRONTEND_URL=https://your-frontend.up.railway.app
railway variables set NODE_ENV=production
railway up
```

After deploy, run migrations:
```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
```

### 4. Deploy Frontend
```bash
cd frontend
railway init
railway variables set VITE_API_URL=https://your-backend.up.railway.app
railway variables set VITE_SOCKET_URL=https://your-backend.up.railway.app
npm run build
railway up
```

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/projects | JWT | My projects |
| POST | /api/projects | JWT | Create project |
| GET | /api/projects/:id | Member | Project details |
| PUT | /api/projects/:id | Admin | Update project |
| DELETE | /api/projects/:id | Admin | Delete project |
| POST | /api/projects/:id/members | Admin | Add member |
| DELETE | /api/projects/:id/members/:uid | Admin | Remove member |
| GET | /api/projects/:id/tasks | Member | List tasks |
| POST | /api/projects/:id/tasks | Member | Create task |
| PUT | /api/tasks/:id | JWT | Update task |
| DELETE | /api/tasks/:id | JWT | Delete task |
| GET | /api/dashboard | JWT | Dashboard stats |

## Features
- ✅ JWT Authentication (Register/Login)
- ✅ Project CRUD with member management
- ✅ Drag-and-drop Kanban board (HTML5 DnD)
- ✅ Real-time task updates via Socket.io
- ✅ Per-project role-based access (Admin/Member)
- ✅ Global admin role
- ✅ Dashboard with stats and overdue tracking
- ✅ Task priority, due date, assignee
- ✅ Dark glassmorphism UI
