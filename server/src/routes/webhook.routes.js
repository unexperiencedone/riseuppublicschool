import { Router } from 'express';
import express from 'express';
import { razorpayWebhook } from '../controllers/payment.controller.js';

const router = Router();

/**
 * Webhooks need the RAW body for HMAC verification, so this router is mounted
 * BEFORE express.json() in app.js and parses its own body.
 */
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  (req, _res, next) => {
    req.rawBody = req.body;
    try { req.body = JSON.parse(req.body.toString('utf8')); } catch { req.body = {}; }
    next();
  },
  razorpayWebhook
);

export default router;
