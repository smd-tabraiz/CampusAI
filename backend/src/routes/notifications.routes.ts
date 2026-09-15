import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, NotificationsController.getNotifications);
router.put('/:id/read', authenticate, NotificationsController.markAsRead);
router.put('/read-all', authenticate, NotificationsController.markAllRead);

export default router;
