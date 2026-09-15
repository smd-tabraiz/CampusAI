import { Router } from 'express';
import authRoutes from './auth.routes';
import aiRoutes from './ai.routes';
import navigationRoutes from './navigation.routes';
import lostFoundRoutes from './lost-found.routes';
import foodRoutes from './food.routes';
import roommateRoutes from './roommate.routes';
import eventsRoutes from './events.routes';
import notificationsRoutes from './notifications.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/', navigationRoutes);
router.use('/lost-found', lostFoundRoutes);
router.use('/', foodRoutes);
router.use('/roommates', roommateRoutes);
router.use('/events', eventsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusAI Core API Engine',
    version: '1.0.0'
  });
});

export default router;
