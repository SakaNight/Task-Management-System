# Task Management System

A full-stack task management system with a modern UI, featuring authentication, task CRUD, file attachments, filtering, and visualized task statistics.

---

## Screenshots

### Welcome Page
![Home](./screenshots/Welcome.jpg)

---

## Features

- JWT Authentication (Register / Login / Logout)
- Create / Read / Update / Delete Tasks
- Task Filtering by status (todo, in_progress, stuck, done)
- File Upload & Download for each task
- Pie Chart Visualization for task status
- Responsive, Dark Mode-Ready UI
- Secure API with Role-Based Access
- PostgreSQL + Prisma ORM

---

## Project Structure

```bash
Task-Management-System/
├── backend/              # FastAPI backend
│   ├── main.py
│   ├── auth.py
│   ├── routes/
│   ├── db.py
│   └── prisma/           # Prisma schema & migrations
│
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── tasks/page.tsx
│   │   │   ├── tasks/stats/page.tsx
│   │   │   └── layout.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── types.ts
│   │   └── styles/globals.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── next.config.ts
│
├── docker-compose.yml
├── README.md
└── .env / .env.production
```

---

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS with custom glassmorphism theme
- Recharts for data visualization
- Axios for API requests

### Backend
- FastAPI (Python 3.10+)
- JWT Authentication
- Prisma ORM (prisma-client-py)
- PostgreSQL
- Docker for containerized backend + DB

---

## 🚀 Local Development

1. Clone the repository
```bash
    git clone https://github.com/your-username/task-management-system.git
    cd task-management-system
```
2. Setup environment variables
```bash
    Create a .env file in the backend/ directory:
    DATABASE_URL=postgresql://postgres:password@localhost:5432/tasks_db
    JWT_SECRET=your_jwt_secret
```
3. Run PostgreSQL & Prisma Migrate
```bash
    docker compose up -d postgres
    cd backend
    prisma db push
```
4. Start Backend
```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 5001
```
5. Start Frontend
```bash
    cd frontend
    npm install
    npm run dev
```
Now open http://localhost:3000

---

## Testing

- Login & Register
- Add/Edit/Delete Task
- Attach File to Task
- View Pie Chart Stats
- Filter by Status

---

## Deployment

This project can be deployed using:
- Docker
- AWS EC2
- PostgreSQL managed services

---

## 📄 License

MIT © 2025 [Aries Chen]
