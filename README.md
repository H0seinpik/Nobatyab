# Nobatyab — Appointment Reservation Platform

Modular appointment booking system with Node.js/Express backend and Vue 3 frontend.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Neon cloud)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials (`DB_*` vars and `DATABASE_URL`).

```bash
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

API runs at `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Troubleshooting

### PostgreSQL not running

If you see `P1001: Can't reach database server`:

**Option A — Docker (if installed):**

```bash
docker compose up -d postgres
npm run setup:db
```

**Option B — Local PostgreSQL or Neon:**

1. Set `DATABASE_URL` in [`backend/.env`](backend/.env)
2. Run `npm run setup:db` from the project root

### Verify API

With backend running (`npm run dev:backend`):

```bash
npm run smoke
```

### First-time setup (from project root)

```bash
npm run setup:db
npm run dev:backend
npm run dev:frontend
```

## Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nobatyab.com | Admin123! |
| Provider | provider@nobatyab.com | Provider123! |
| User | user@nobatyab.com | User123! |

## API base URL

- Backend: `http://localhost:3000/api/v1`
- Health: `GET /health`

## Environment variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env`](frontend/.env).
