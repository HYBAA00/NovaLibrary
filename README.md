# Digital Library (scaffold)

Structure scaffold for a digital library (Node.js + React).

Quick setup:

Backend

1. Copy `.env.example` to `.env` and set values (MySQL credentials, JWT secret).
2. From `backend/` run:

```bash
npm install
npm run dev
```

Frontend

1. Copy `.env.example` to `.env` in `frontend/` and set `VITE_API_URL`.
2. From `frontend/` run:

```bash
npm install
npm run dev
```

Database

Run the SQL script `sql/init_db.sql` in DBeaver to create the database and tables.
