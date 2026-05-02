// src/app.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes        from './routes/auth.routes.js';
import itemRoutes        from './routes/item.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import categoryRoutes    from './routes/category.routes.js';
import locationRoutes    from './routes/location.routes.js';
import userRoutes        from './routes/user.routes.js';

import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { prisma } from './prisma/client.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────
// SECURITY MIDDLEWARES
// ─────────────────────────────────────────
app.use(helmet());  // sets secure HTTP headers

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow Postman / server-to-server (no origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin "${origin}" not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting – global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // max 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
}));

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // only 20 login attempts per 15 min
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later.',
  },
});

// ─────────────────────────────────────────
// BODY PARSING
// ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────
// LOGGING
// ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Database connection failed',
    });
  }
});

// ─────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/items',        itemRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/locations',    locationRoutes);
app.use('/api/users',        userRoutes);

// ─────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🚀 Inventory API                   ║
  ║   Port:     ${PORT}                      ║
  ║   Env:      ${process.env.NODE_ENV || 'development'}              ║
  ║   Health:   /health                  ║
  ╚══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received – shutting down gracefully');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;