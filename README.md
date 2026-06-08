# Nobatyab — Appointment Reservation Platform

Modular appointment booking system with Node.js/Express backend and Vue 3 frontend.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials (`DB_*` vars and `DATABASE_URL`).

```bash
npm install
npx prisma migrate deploy   # or: npx prisma migrate dev
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

**Option B — Local PostgreSQL:**

1. Install [PostgreSQL](https://www.postgresql.org/download/) and start the service
2. Create the database: `CREATE DATABASE nobatyab;`
3. Update [`backend/.env`](backend/.env) with correct `DB_*` and `DATABASE_URL`
4. Run `npm run setup:db` from the project root

### Verify API

With backend running (`npm run dev:backend`):

```bash
npm run smoke
```

### First-time setup (from project root)

```bash
npm run setup:db      # migrate + seed
npm run dev:backend   # terminal 1
npm run dev:frontend  # terminal 2
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

## Project structure

```
backend/     Express + Prisma + PostgreSQL
frontend/    Vue 3 + Pinia + Tailwind + Jalali dates
```

## Features

- JWT auth (access + refresh tokens)
- Role-based dashboards (User, Provider, Admin)
- Dynamic slot generation from working hours
- Appointment lifecycle with cancellation policy
- Simulated payment & SMS (pluggable interfaces)
- Persian (Jalali) calendar display

## Environment variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env`](frontend/.env).
