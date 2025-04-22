# 📝 Task Management System

A full-stack task management system with user authentication, task creation, filtering, file upload, and status analytics.

## ✨ Features

- 🔐 **Authentication**: Register/Login with JWT-based auth
- ✅ **Task Management**: Create, update, delete, filter by status
- 📁 **File Upload**: Attach and delete files for each task
- 📊 **Task Statistics**: View task status distribution as pie chart
- 🐳 **Dockerized**: Easily run with `docker-compose`

## 🧱 Tech Stack

| Layer       | Stack                          |
|-------------|--------------------------------|
| Frontend    | Next.js + TypeScript + Tailwind |
| Backend     | FastAPI + Python               |
| Database    | PostgreSQL                     |
| ORM         | Prisma (Python client)         |
| Auth        | JWT                            |
| Deployment  | Docker + Docker Compose        |

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/task-management-system.git
cd task-management-system