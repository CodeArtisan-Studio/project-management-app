import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, isDevelopment, isTest } from '@/config/env';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { AppError } from '@/utils/appError';
import { authRoutes } from '@/modules/auth/auth.routes';
import { userRoutes } from '@/modules/user/user.routes';
import { projectRoutes } from '@/modules/project/project.routes';
import { swaggerSpec, swaggerUi } from '@/config/swagger';

const app = express();

// ─── API Docs ───────────────────────────────────────────
// Must be registered BEFORE the global helmet() call so that the
// route-specific helmet (CSP disabled) wins for /api-docs requests.
// Swagger UI v5 requires inline scripts that strict CSP would block.
app.use('/api-docs', helmet({ contentSecurityPolicy: false }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Project Management API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// ─── Security ──────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ─── Rate Limiting ─────────────────────────────────────
// Skipped in test mode — tests are not subject to rate limits.
if (!isTest) {
  const limiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);
}

// ─── Body Parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Compression & Logging ─────────────────────────────
app.use(compression());
// Suppress HTTP logs in test output to keep Jest results readable.
if (!isTest) {
  app.use(morgan(isDevelopment ? 'dev' : 'combined'));
}

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// ─── 404 Catch-All ─────────────────────────────────────
app.all('/{*splat}', (req: Request, _res: Response) => {
  throw AppError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server.`);
});

// ─── Global Error Handler ──────────────────────────────
app.use(errorMiddleware);

export { app };
