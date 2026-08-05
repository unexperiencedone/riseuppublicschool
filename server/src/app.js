import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import env from './config/env.js';
import routes from './routes/index.js';
import webhookRoutes from './routes/webhook.routes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { UPLOAD_ROOT } from './middleware/upload.js';

const app = express();

/* ── 1. Trust proxy (Render/Vercel sit behind a load balancer) ── */
app.set('trust proxy', 1);

/* ── 2. Security headers ── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },   // allow the Next.js origin to load /uploads
  contentSecurityPolicy: false,
}));

/* ── 3. CORS — explicit allowlist, credentials on for refresh cookies ── */
const allowlist = [env.clientUrl, env.adminUrl, 'http://localhost:3000', 'http://localhost:5173'].filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowlist.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

/* ── 4. Webhooks BEFORE the JSON parser (raw body needed for HMAC) ── */
app.use(`${env.apiPrefix}/webhooks`, webhookRoutes);

/* ── 5. Body parsing + sanitisation ── */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize());     // strips $ and . from keys → blocks NoSQL injection
app.use(hpp());               // blocks HTTP parameter pollution
app.use(compression());

/* ── 6. Logging ── */
if (!env.isProd) app.use(morgan('dev'));
else app.use(morgan('combined'));

/* ── 7. Static uploads (local storage driver only — dead weight on Vercel,
   whose filesystem is read-only outside /tmp, so this mount is skipped
   entirely unless STORAGE_DRIVER=local) ── */
if (env.storage.driver === 'local') {
  app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '30d', etag: true }));
}

/* ── 8. Health & readiness probes ── */
app.get('/health', (_req, res) => res.json({
  success: true, status: 'ok', uptime: process.uptime(), env: env.nodeEnv, timestamp: new Date().toISOString(),
}));

/* ── 9. API ── */
app.use(env.apiPrefix, apiLimiter, routes);

/* ── 10. 404 + centralised error handler (must be last) ── */
app.use(notFound);
app.use(errorHandler);

export default app;
