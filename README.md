# Task Tracker + Notes (Full-Stack Internship Assignment)

A production-ready full-stack application with:

- Real user authentication (JWT login/signup)
- Backend API with protected routes
- MongoDB database integration
- User-specific data isolation
- Responsive UI with React + Tailwind

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT + bcryptjs
- HTTP client: Axios

## Project Structure

```
paid int/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      server.js
  frontend/
    src/
      lib/
      App.jsx
      index.css
```

## Features Implemented

- Signup, login, logout
- JWT-based protected API access
- Create, read, update, delete tasks
- Task status flow: `todo` -> `in-progress` -> `done`
- Optional notes per task
- Each user can only access their own tasks

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /health` - health check
- `POST /auth/signup` - register user
- `POST /auth/login` - login user
- `GET /auth/me` - current user profile (protected)
- `GET /tasks` - list own tasks (protected)
- `POST /tasks` - create task (protected)
- `PUT /tasks/:id` - update own task (protected)
- `DELETE /tasks/:id` - delete own task (protected)

## Local Setup

### 1) Clone and install

```bash
# from repository root
cd backend
npm install

cd ../frontend
npm install
```

### 2) Environment files

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3) Run backend

```bash
cd backend
npm run dev
```

### 4) Run frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Deployment Guide

### Backend on Render/Railway

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `PORT` (if required by platform)
  - `FRONTEND_URL` (your Vercel frontend URL)

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_URL` = deployed backend URL + `/api`

## Screenshots

After running locally, add screenshots under a folder like `screenshots/` and reference them here.

## Submission Checklist

- [ ] Push code to GitHub with clean commit history
- [ ] Deploy backend and frontend
- [ ] Update README links (repo + live URLs)
- [ ] Fill Google Form with both links
