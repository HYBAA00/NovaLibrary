# NovaLibrary

NovaLibrary is a full-stack digital library built with Node.js, Express, MySQL, React and Vite.

## Highlights

- Secure authentication with JWT and role-based admin access.
- Public catalogue with search, category filters, sorting and pagination.
- PDF reader, covers, reviews, ratings, favorites and reading status.
- Personal reading lists.
- Admin dashboard for books, users, authors, categories, reviews and book requests.
- Book request workflow for readers.
- Catalogue-aware chatbot assistant.
- Hardened API with Helmet, compression, rate limiting, health check and clean errors.

## Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Default API URL: `http://localhost:4000`

Health check: `http://localhost:4000/health`

## Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Database

Run `sql/init_db.sql` in MySQL/DBeaver to create the database and tables.

The first registered user becomes `ADMIN`; all later registrations become `USER`.
