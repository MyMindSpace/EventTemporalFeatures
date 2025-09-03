const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');
const eventRoutes = require('./routes/events');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase
initializeFirebase();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Events Temporal Features CRUD Service'
  });
});

// Debug middleware to log all requests
app.use('*', (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use('/api/events', eventRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Events Temporal Features CRUD Service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check available at /health`);
  console.log(`📅 Events API available at /api/events`);
  console.log(`🔍 Server listening on all interfaces (0.0.0.0:${PORT})`);
});

// Graceful shutdown handling for cloud deployments
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});
