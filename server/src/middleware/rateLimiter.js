import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import logger from '../config/logger.js';

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
};

const USE_UPSTASH = Boolean(env.upstash.url && env.upstash.token);

/**
 * Each serverless invocation is its own process with its own memory, so
 * express-rate-limit's in-memory store counts nothing across lambdas — every
 * request looks like the first one. Upstash Redis (HTTP-based, so it works
 * from a stateless function) gives every invocation the same shared counter.
 * Lazily imported: `@upstash/*` are optionalDependencies, matching the
 * cloudinary/razorpay pattern in services/ — installing them is unnecessary
 * (and UNSET env vars mean unnecessary) for local dev.
 */
let upstashModules = null;
async function getUpstash() {
  if (upstashModules) return upstashModules;
  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import('@upstash/ratelimit'),
    import('@upstash/redis'),
  ]);
  const redis = new Redis({ url: env.upstash.url, token: env.upstash.token });
  upstashModules = { Ratelimit, redis };
  return upstashModules;
}

/**
 * Builds one limiter. Upstash mode when UPSTASH_REDIS_REST_URL/TOKEN are set,
 * otherwise the original in-memory express-rate-limit middleware.
 */
function makeLimiter({ prefix, windowMs, max, message, skipSuccessfulRequests = false }) {
  if (!USE_UPSTASH) {
    return rateLimit({ ...base, windowMs, max, skipSuccessfulRequests, message: message || base.message });
  }

  let limiter = null;
  return async (req, res, next) => {
    try {
      const { Ratelimit, redis } = await getUpstash();
      if (!limiter) {
        limiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(max, `${Math.max(1, Math.round(windowMs / 1000))} s`),
          prefix: `rups:rl:${prefix}`,
        });
      }
      const identifier = req.ip || 'unknown';
      const { success, limit, remaining, reset } = await limiter.limit(identifier);
      res.setHeader('RateLimit-Limit', String(limit));
      res.setHeader('RateLimit-Remaining', String(Math.max(0, remaining)));
      res.setHeader('RateLimit-Reset', String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))));
      if (!success) return res.status(429).json(message || base.message);
      return next();
    } catch (err) {
      // Redis unreachable — fail OPEN. A rate limiter outage must never take the site down.
      logger.error(`Upstash rate limit check failed (${prefix}), allowing request: ${err.message}`);
      return next();
    }
  };
}

export const apiLimiter = makeLimiter({
  prefix: 'api',
  windowMs: env.rateLimit.windowMin * 60 * 1000,
  max: env.rateLimit.max,
});

/** Tight limit for unauthenticated public forms (enquiry, contact, uploads). */
export const publicFormLimiter = makeLimiter({
  prefix: 'public-form',
  windowMs: 60 * 60 * 1000,
  max: env.rateLimit.publicFormMax,
  message: { success: false, message: 'Too many submissions from this device. Please try again after an hour.', code: 'RATE_LIMITED' },
});

/**
 * NOTE — behavioural difference in Upstash mode: the in-memory fallback uses
 * `skipSuccessfulRequests` so only *failed* logins count toward the budget.
 * Upstash's sliding-window algorithm has no supported "uncount this token"
 * operation, so in Upstash mode every attempt (success or failure) counts.
 * This is strictly tighter, never looser, so it degrades safely — but a
 * legitimate user who logs in 10 times in 15 minutes (multiple devices, a
 * flaky network) will get rate-limited in a way they would not locally.
 * Documented in docs/ARCHITECTURE.md § Serverless considerations.
 */
export const authLimiter = makeLimiter({
  prefix: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' },
});
