# Baat — single-service deployment

This project is a single Render web service backed by one PostgreSQL database.

## Architecture

The frontend is built from the repository root and the Node backend in `backend/` serves the generated static files from `dist/` on the same origin.

Browser → Render Web Service (Express API + frontend) �� Render PostgreSQL

## Render configuration

The included `render.yaml` defines exactly:

- one web service named `baat`
- one PostgreSQL database named `baat-db`

Build command:

```bash
npm install && npm run install:backend && npm run build && npm run build:backend
```

Start command:

```bash
npm start
```

Required environment variables:

- `DATABASE_URL` — set by Render when you attach the Postgres database
- `JWT_SECRET` — a long random secret, not committed to GitHub
- `CLIENT_ORIGIN` — the single Render service URL, for example `https://baat.onrender.com`
- `PORT` — supplied by Render automatically

## Local development

For local development only, the frontend can talk to the backend at `http://localhost:3000` by setting `VITE_API_BASE_URL`.

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
npm install
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

In production, do not set `VITE_API_BASE_URL`; the frontend uses the same origin (`/api/...`).

## Backend and health checks

The backend exposes:

- `/health`
- `/api/auth/register`
- `/api/auth/login`
- `/api/chats`
- `/api/chats/:id/messages`
- `/ws` for websocket usage

The database schema is initialized from `backend/schema.sql` when the app starts and `DATABASE_URL` is present.
