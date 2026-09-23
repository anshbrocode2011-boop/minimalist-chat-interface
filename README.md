# Baat — single-service full-stack deployment

This repository contains the existing Baat Vite/TanStack frontend and Express/PostgreSQL backend in one deployable application.

## Architecture

```text
Browser → one Render Web Service (Express API + built frontend) → Render PostgreSQL
```

The frontend is built from the repository root. The backend in `backend/` serves the generated frontend files and handles `/api/*`, `/health`, and `/ws` on the same origin. Production requests therefore use relative `/api/...` URLs; no separate frontend or backend service is required.

## Render

The included `render.yaml` defines exactly one web service named `baat` and one PostgreSQL database named `baat-db`.

Build command:

```bash
npm install && npm run install:backend && npm run build && npm run build:backend
```

Start command:

```bash
npm start
```

Required environment variables:

- `DATABASE_URL` — supplied by the Render PostgreSQL database.
- `JWT_SECRET` — a long random secret; do not commit it.
- `CLIENT_ORIGIN` — the single Render service URL, for example `https://baat.onrender.com`.
- `PORT` — Render supplies this automatically; the server respects it. You may leave it unset.

The backend initializes `backend/schema.sql` safely at startup with `CREATE TABLE IF NOT EXISTS`. If you prefer manual initialization, run:

```bash
psql "$DATABASE_URL" -f backend/schema.sql
```

## Local development

Create `backend/.env` from `backend/.env.example`, set `DATABASE_URL` and `JWT_SECRET`, then run the backend and frontend separately:

```bash
cd backend && npm install && npm run dev
```

In another terminal:

```bash
npm install
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

In production, do not set `VITE_API_BASE_URL`; the client uses the same origin. The API client stores the JWT session locally and sends it on authenticated requests. WebSocket connections remain available at `/ws?token=...` on the same service.
