import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import * as v from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: v.registerSchema }), c.register);
router.post('/login', authLimiter, validate({ body: v.loginSchema }), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);
router.patch('/change-password', requireAuth, validate({ body: v.changePasswordSchema }), c.changePassword);
router.post('/forgot-password', authLimiter, validate({ body: v.forgotPasswordSchema }), c.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: v.resetPasswordSchema }), c.resetPassword);

export default router;
