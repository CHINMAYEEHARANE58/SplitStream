# SplitStream

**Split expenses. Understand spending. Settle smarter.**

SplitStream is a full-stack shared-expense application. Its first priority is a polished, usable product; the Kafka, Spark, Airflow, and data-lake architecture will enhance that working product later.

## Current milestone: Phase 1A complete

The application now has a React + TypeScript frontend, a FastAPI + PostgreSQL backend, and a real authentication flow.

- Landing page with product preview
- Registration with client- and server-side validation
- Login and JWT session restoration
- Protected application routes
- Responsive sidebar/drawer navigation
- Dashboard, Groups, Activity, Analytics, Settlements, and Settings shells with intentional empty states
- Argon2 password hashes and PostgreSQL-backed users

Groups, expenses, balances, settlements, and analytics are deliberately **not** implemented yet. They begin in Phase 1B only after this frontend foundation is verified.

## Run the application

### 1. Start the API and database

```bash
docker compose up --build
```

The API runs at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Start the frontend

In a second terminal:

```bash
npm run dev --prefix frontend
```

Open [http://localhost:5173](http://localhost:5173).

## Validation commands

```bash
npm run build --prefix frontend
.venv/bin/pytest -q
```

## Authentication flow

```text
Register/Login form → FastAPI validation → PostgreSQL users table
                                    ↓
                              Argon2 hash
                                    ↓
                              JWT access token
                                    ↓
                    browser local storage → /users/me
```

The frontend API client lives in `frontend/src/api/`. It adds the JWT as a Bearer token automatically. Browser CORS is limited to local Vite origins in the FastAPI application.

## Existing API endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me` — requires `Authorization: Bearer <access_token>`
- `GET /health`

## Project structure

```text
frontend/          React, TypeScript, Vite, Tailwind, React Router
backend/           FastAPI application and tests
docs/              Architecture notes
docker-compose.yml PostgreSQL and API development services
```

## Next milestone

**Phase 1B — Groups and members:** create the group model/API and immediately pair it with the Groups page and Create Group interface.
