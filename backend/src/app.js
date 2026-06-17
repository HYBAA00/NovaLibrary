const express = require('express');
const cors = require('cors');
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
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

const corsOptions = {
	origin: ['http://localhost:5173', 'http://localhost:5174'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

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

app.use(errorMiddleware);

module.exports = app;
