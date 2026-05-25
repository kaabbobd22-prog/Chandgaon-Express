require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Make io accessible throughout the app
app.set('io', io);

// DB Connect
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/shops',    require('./routes/shops'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Chandgaon Express API running 🛵' }));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_order', (orderId) => socket.join(`order_${orderId}`));
  socket.on('join_admin', () => socket.join('admin_room'));
  socket.on('join_rider', (riderId) => socket.join(`rider_${riderId}`));

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { io };
