import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protect all admin routes with authentication and ADMIN role
router.use(authenticate, requireRole(['ADMIN']));

router.get('/analytics', AdminController.getAnalytics);
router.get('/users', AdminController.getUsers);
router.put('/users/:id/role', AdminController.updateUserRole);
router.get('/knowledge-base', AdminController.getKnowledgeBase);
router.post('/knowledge-base', AdminController.createKnowledgeBase);
router.put('/knowledge-base/:id', AdminController.updateKnowledgeBase);
router.delete('/knowledge-base/:id', AdminController.deleteKnowledgeBase);

export default router;
