import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import logger from '../src/config/logger.js';

/**
 * Vercel serverless entry point. `src/server.js` (app.listen) stays the entry
 * point for `npm run dev` / any long-running host (Render, a VM, etc.) — this
 * file exists purely to adapt the same Express app to Vercel's Node runtime,
 * which expects a (req, res) handler rather than a bound listener.
 *
 * connectDB() is cheap on a warm invocation: the connection promise is cached
 * on globalThis (see src/config/db.js), so this only actually dials Atlas on
 * a cold start.
 */
export default async function handler(req, res) {
  try {
    globalThis.__dbPromise ??= connectDB();
    await globalThis.__dbPromise;
  } catch (err) {
    globalThis.__dbPromise = undefined;          // never cache a rejection
    logger.error(`DB connection failed: ${err.message}`);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      message: 'Database temporarily unavailable',
      code: 'DB_UNAVAILABLE',
    }));
  }
  return app(req, res);
}