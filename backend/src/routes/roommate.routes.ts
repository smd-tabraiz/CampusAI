import { Router } from 'express';
import { RoommateController } from '../controllers/roommate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, RoommateController.getProfile);
router.post('/profile', authenticate, RoommateController.upsertProfile);
router.get('/matches', authenticate, RoommateController.getMatches);
router.post('/connect', authenticate, RoommateController.connect);
router.get('/connections', authenticate, RoommateController.getConnections);
router.put('/connections/:id', authenticate, RoommateController.respondConnection);

export default router;
