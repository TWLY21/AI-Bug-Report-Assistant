# BugSense — AI Bug Report Assistant

BugSense is an AI-powered QA support tool that converts raw logs, incomplete bug notes, and messy issue descriptions into structured, professional bug reports.

## Why This Project

QA reports often arrive as mixed text, logs, screenshots context, and incomplete steps. BugSense standardizes these inputs into a triage-ready format, while preserving technical meaning and avoiding unsupported assumptions.

## Features

- AI bug report generation from unstructured raw input
- Structured output fields for professional QA handoff
- Smart severity and priority suggestions
- Per-field copy actions + copy full report
- Export as Markdown and JSON
- Edit generated fields before saving to history
- AI retry, timeout handling, and heuristic fallback mode
- Sample bug cases for instant demo
- Report history with search and severity filtering
- Report detail view and deletion
- JWT authentication with password hashing
- User-isolated history (multi-user safe)
- Dashboard with summary cards and recent reports

## Tech Stack

- Frontend: Vue 3, Vite, Vue Router, Pinia, Tailwind CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- AI: Google Gemini API (server-side only, via OpenAI-compatible endpoint)

## Screenshots

Add screenshots in this section:

- `docs/screenshots/landing.png`
- `docs/screenshots/generate.png`
- `docs/screenshots/history.png`
- `docs/screenshots/report-detail.png`

## Architecture Overview

- `client/` contains the Vue SPA and UI workflow.
- `server/` contains REST APIs, auth, validation, Gemini orchestration, and PostgreSQL data access.
- API key and JWT secret are only configured on backend.
- Generated report JSON can be reviewed before saving.

## Folder Structure

```text
bugsense/
  client/
    src/
      components/
      constants/
      router/
      services/
      stores/
      utils/
      views/
  server/
    sql/
      init.sql
    src/
      config/
      middleware/
      modules/
        auth/
        dashboard/
        reports/
      routes/
      utils/
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Reports

- `POST /api/reports/generate`
- `POST /api/reports`
- `GET /api/reports`
- `GET /api/reports/:id`
- `DELETE /api/reports/:id`

### Dashboard

- `GET /api/dashboard/summary`

## Setup Instructions

## 1. Clone and enter project

```bash
git clone <your-repo-url>
cd bugsense
```

## 2. Start PostgreSQL

Option A: local PostgreSQL

- Create DB named `bugsense`
- Update `server/.env` accordingly

Option B: Docker

```bash
docker compose up -d
```

## 3. Initialize database schema

Run SQL file:

- `server/sql/init.sql`

Example with psql:

```bash
psql -U postgres -d bugsense -f server/sql/init.sql
```

## 4. Configure environment variables

```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Set real values in `server/.env`:

- `DATABASE_URL`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, default: `gemini-2.5-flash`)
- `GEMINI_BASE_URL` (optional, default: Google OpenAI-compatible endpoint)
- `GEMINI_TIMEOUT_MS` (optional, default: `20000`)
- `GEMINI_MAX_RETRIES` (optional, default: `2`)
- `AI_FALLBACK_MODE` (optional, `heuristic` or `none`, default: `heuristic`)

## 5. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 6. Run backend and frontend

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment Variables

See:

- `server/.env.example`
- `client/.env.example`
- root `.env.example`

## Prompting Strategy (Backend)

The backend prompt enforces:

- strict JSON output schema
- conservative severity/priority inference
- professional QA tone
- "Not specified" for missing details
- no unsupported technical assumptions

## Security Notes

- Passwords hashed with `bcryptjs`
- JWT auth for protected routes
- API key stored only on server
- User-based ownership checks for report access

## Future Improvements

- Dark mode toggle
- Editable generated sections before save
- Jira-style export format
- Pagination UI controls
- Report regeneration with prompt variants
- Team/org workspaces and role-based access
- E2E tests for core auth + report workflows





