require('dotenv').config();
const app = require('./app');
const express = require('express');
const path = require('path');
// serve uploaded files statically at /uploads (use absolute path)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// mount API routers (some routers also registered in app.js for consistency)
const favoritesRouter = require('./routes/favorites.routes');
const readingStatusRouter = require('./routes/reading_status.routes');
const readingListsRouter = require('./routes/reading_lists.routes');
app.use('/api/favorites', favoritesRouter);
app.use('/api/reading-status', readingStatusRouter);
app.use('/api/reading-lists', readingListsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
