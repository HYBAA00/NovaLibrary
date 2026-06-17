require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./realtime/socket');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => console.log(`NovaLibrary API running on port ${PORT}`));
