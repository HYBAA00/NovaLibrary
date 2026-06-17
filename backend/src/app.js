const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const booksRoutes = require('./routes/books.routes');
const usersRoutes = require('./routes/users.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const categoriesRoutes = require('./routes/categories.routes');
const authorsRoutes = require('./routes/authors.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const readingStatusRoutes = require('./routes/reading_status.routes');
const readingListsRoutes = require('./routes/reading_lists.routes');
const bookRequestsRoutes = require('./routes/book_requests.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
	.split(',')
	.map(origin => origin.trim())
	.filter(Boolean);

const corsOptions = {
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
};

app.disable('x-powered-by');
app.use(helmet({
	contentSecurityPolicy: false,
	crossOriginResourcePolicy: false,
	frameguard: false,
}));
app.use(compression());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 500,
	standardHeaders: true,
	legacyHeaders: false,
}));

app.get('/health', (req, res) => {
	res.json({ ok: true, service: 'NovaLibrary API', timestamp: new Date().toISOString() });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
	maxAge: '7d',
	immutable: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/authors', authorsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reading-status', readingStatusRoutes);
app.use('/api/reading-lists', readingListsRoutes);
app.use('/api/book-requests', bookRequestsRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Route introuvable' });
});

app.use(errorMiddleware);

module.exports = app;
