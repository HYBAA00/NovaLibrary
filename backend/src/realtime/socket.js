const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function allowedOrigins() {
  return (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
}

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins(),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentification requise'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      next();
    } catch (error) {
      next(new Error('Session invalide'));
    }
  });

  io.on('connection', socket => {
    const user = socket.user;
    io.emit('live:presence', { type: 'join', user: { id: user.id, name: user.name, role: user.role } });

    socket.on('live:message', async (payload, ack) => {
      try {
        const message = String(payload?.message || '').trim().slice(0, 1200);
        if (!message) return ack?.({ ok: false, message: 'Message vide' });
        const [result] = await pool.query(
          'INSERT INTO live_messages (user_id, message) VALUES (?, ?)',
          [user.id, message]
        );
        const event = {
          id: result.insertId,
          message,
          created_at: new Date().toISOString(),
          user_id: user.id,
          user_name: user.name || user.email,
          user_role: user.role,
        };
        io.emit('live:message', event);
        ack?.({ ok: true });
      } catch (error) {
        ack?.({ ok: false, message: 'Erreur live chat' });
      }
    });

    socket.on('disconnect', () => {
      io.emit('live:presence', { type: 'leave', user: { id: user.id, name: user.name, role: user.role } });
    });
  });

  return io;
}

module.exports = { initSocket };
