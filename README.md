# C_S_farm - Full Project (Backend + Frontend + Docker + CI)

This repository contains a full scaffold for the C. Sambu Farm Management System:
- FastAPI backend (PostgreSQL-ready)
- React PWA frontend (placeholder)
- Docker & docker-compose for easy local deployment
- GitHub Actions workflow (CI) skeleton

## Quick start (development using Docker Compose)

1. Ensure Docker and Docker Compose are installed.
2. From project root, build and start services:
```bash
docker compose up --build
```
3. Backend API will be at `http://localhost:8000` and docs at `http://localhost:8000/docs`.
4. Frontend dev server (if running locally) will be started with `npm install` and `npm run dev` in `frontend/`.

## Environment

The backend expects `DATABASE_URL` env var. `docker-compose.yml` configures Postgres for you automatically.

## Pushing to GitHub

1. Initialize git in the project (if not already) and add remote to your repo:
```bash
git init
git remote add origin https://github.com/llakterian/C_S_farm.git
git add .
git commit -m "Initial full scaffold: backend + frontend + docker + ci"
git branch -M main
git push -u origin main
```

---

