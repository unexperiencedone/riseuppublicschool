import { Router } from 'express';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import portalRoutes from './portal.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/', (_req, res) => res.json({
  success: true,
  message: 'Rise UP Public School API',
  version: '1.0.0',
  docs: '/API_ENDPOINTS.md',
}));

router.use('/auth', authRoutes);
router.use('/portal', portalRoutes);
router.use('/admin', adminRoutes);
router.use('/', publicRoutes);   // public routes last so they don't shadow the above

export default router;
