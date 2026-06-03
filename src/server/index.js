import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import db from './db/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import customerRoutes from './routes/customers.js';
import destinationRoutes from './routes/destinations.js';
import deliveryTypeRoutes from './routes/delivery-types.js';
import productRoutes from './routes/products.js';
import salesOrderRoutes from './routes/sales-orders.js';
import deliveryRoutes from './routes/delivery.js';
import alertRoutes from './routes/alerts.js';
import webhookRoutes from './routes/webhooks.js';
import reportRoutes from './routes/reports.js';
import auditRoutes from './routes/audit.js';
import permissionRoutes from './routes/permissions.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 43118;
const HOST = process.env.HOST || '127.0.0.1';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: isDev
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    // Test database connection
    const result = db.prepare('SELECT 1 as test').get();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected',
      version: '2.0.0-dev',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/delivery-types', deliveryTypeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/permissions', permissionRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', '..', 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.path,
    },
  });
});

// Start server
app.listen(PORT, HOST, () => {
  logger.info(`SO Management Server started`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Server running at http://${HOST}:${PORT}`);
  logger.info(`API available at http://${HOST}:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing server gracefully...');
  db.close();
  process.exit(0);
});

export default app;