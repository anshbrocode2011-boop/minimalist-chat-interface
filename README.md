# Baat — combined frontend and backend deployment

This repository now contains the Baat API in `backend/` and the premium chat frontend in the repository root.

## Render deployment

Use the included `render.yaml` blueprint. Before deploying, replace these two placeholders with your actual Render service URLs:

- `YOUR-FRONTEND-SERVICE.onrender.com` in `CLIENT_ORIGIN`
- `YOUR-BAAT-API-SERVICE.onrender.com` in `VITE_API_BASE_URL`

Render will provide `DATABASE_URL` from the managed PostgreSQL database and generate `JWT_SECRET` automatically. The frontend API URL is a build-time variable, so set it in Render before the frontend build runs.

## Database initialization

After the PostgreSQL database is created, run `backend/schema.sql` once against it. For example:

```bash
psql "$DATABASE_URL" -f backend/schema.sql
```

## Local development

Terminal 1:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Terminal 2:

```bash
npm install
VITE_API_BASE_URL=http://localhost:3000 npm run dev
```

The frontend API client is in `src/lib/baat-api.ts`. Never commit real database credentials or JWT secrets.
