import { Router } from 'express';
import { LostFoundController } from '../controllers/lost-found.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', LostFoundController.getItems);
router.post('/lost', authenticate, LostFoundController.reportLost);
router.post('/found', authenticate, LostFoundController.reportFound);
router.get('/matches', authenticate, LostFoundController.getMatches);
router.put('/:type/:id/status', authenticate, LostFoundController.updateStatus);

export default router;
