import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/chat', optionalAuth, AiController.chat);
router.post('/classify-intent', AiController.classifyIntent);
router.get('/conversations', authenticate, AiController.getConversations);
router.post('/conversations', authenticate, AiController.createConversation);
router.get('/conversations/:id', authenticate, AiController.getConversation);

export default router;
