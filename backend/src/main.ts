import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import adminRoutes from './routes/admin.routes';
import fileRoutes from './routes/file.routes';
import profileRoutes from './routes/profile.routes';
import bookmarkRoutes from './routes/bookmark.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [
      'https://security-focused-application-all-in.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    credentials: true, // Allow cookies to be sent
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Relaxed limit for development/testing
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Built-in middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Debug endpoint for deployment troubleshooting
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    database_set: !!process.env.DATABASE_URL,
    jwt_set: !!process.env.JWT_SECRET,
    node_env: process.env.NODE_ENV,
    url: 'https://security-focused-application-all-in.vercel.app'
  });
});

app.get('/', (req, res) => {
  res.status(200).send('Security API is running');
});

// Centralized error handler
app.use(errorHandler);

// Export for Vercel
export default app;

// Start server locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
  });
}
