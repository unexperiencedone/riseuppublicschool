import { Router } from 'express';
import express from 'express';
import logger from '../config/logger.js';
import { razorpayWebhook } from '../controllers/payment.controller.js';

const router = Router();

/**
 * Webhooks need the RAW body for HMAC verification, so this router is mounted
 * BEFORE express.json() in app.js and parses its own body.
 *
 * Serverless caveat (Vercel): `@vercel/node` exposes `req.body` as a LAZY
 * getter — it only parses the stream if something reads `req.body` before
 * Express does. `express.raw()` (via the `raw-body` package) reads the
 * stream directly and never touches `req.body`, so this should keep working
 * unchanged on Vercel. That reasoning is NOT deploy-verified: it wasn't
 * possible to confirm from static analysis alone. Before turning on
 * PAYMENTS_DRIVER=razorpay in production, send one real (or Razorpay's
 * dashboard test) webhook to the deployed endpoint and confirm the log line
 * is `Razorpay webhook: payment.captured`, not `Rejected Razorpay webhook: bad signature`.
 * The guard below turns the failure mode from "wrong bytes, silently mis-signs
 * every webhook" into "loud, diagnosable log line" if that assumption is wrong.
 */
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  (req, _res, next) => {
    if (!Buffer.isBuffer(req.body)) {
      // The platform (or an upstream proxy) already parsed the body before we
      // could read it raw — HMAC verification against a re-serialized object
      // is not guaranteed to match what Razorpay actually signed (key order,
      // whitespace). Reconstructing here is best-effort, not a real fix.
      logger.error('Razorpay webhook: req.body was not a raw Buffer — the platform pre-parsed it. HMAC verification may fail for legitimate webhooks. See routes/webhook.routes.js.');
      req.rawBody = Buffer.from(JSON.stringify(req.body || {}));
    } else {
      req.rawBody = req.body;
    }
    try { req.body = JSON.parse(req.rawBody.toString('utf8')); } catch { req.body = {}; }
    next();
  },
  razorpayWebhook
);

export default router;
