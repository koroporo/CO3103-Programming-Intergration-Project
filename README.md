# English Platform

## Local development

Start PostgreSQL from the repository root:

```bash
docker compose up -d
```

Create `backend/.env` with the local Compose credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_platform
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
```

Install backend dependencies and run the account seed migration from `backend`:

```bash
cd backend
npm install
DATABASE_URL='postgres://postgres:postgres@localhost:5432/english_platform' npx node-pg-migrate up --migrations-dir ../database/seed
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend/frontendSE
npm install
npm run dev
```

The Vite development server proxies `/api` requests to the backend on port 3000.
The backend requires the `DB_*` variables above and checks the database
connection before it starts listening.

## Course catalogue API

```text
GET /api/courses?search=IELTS&page=1&limit=20
```

The endpoint returns `{ "courses": [...], "page": 1, "limit": 20, "total": 0 }`,
searches published course titles, descriptions, and category names, and accepts
page sizes from 1 to 50. Search terms are limited to 100 characters. Add
published course records to see them in the catalogue; this repository
currently seeds an account but no courses.

Course cards link to `/courses/:slug`; the course detail page is planned for a
later week.

## Logout integration

The frontend reads the `token` and `user` local-storage keys. Logout sends
`POST /api/auth/logout` with `Authorization: Bearer <token>` and clears local
authentication state after the API confirms logout. This uses the shared
authentication API contract; its implementation must be merged with the auth
feature for the logout request to succeed.
