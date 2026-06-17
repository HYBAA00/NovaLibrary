# NovaLibrary

NovaLibrary is a full-stack digital library built with Node.js, Express, MySQL, React and Vite.

## Highlights

- Secure authentication with JWT and role-based admin access.
- Public catalogue with search, category filters, sorting and pagination.
- PDF reader, covers, reviews, ratings, favorites and reading status.
- Personal reading lists.
- Admin dashboard for books, users, authors, categories, reviews and book requests.
- Book request workflow for readers.
- Mistral-powered catalogue chatbot and AI book summaries.
- Real-time reader live chat with Socket.IO.
- AI-generated QCM quizzes with points and leaderboard ranking.
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

Import local uploaded PDFs/covers into MySQL:

```bash
cd backend
npm run seed:uploads
```

AI setup:

```env
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-large-latest
```

Keep the real key only in `backend/.env`; it is ignored by Git.

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
