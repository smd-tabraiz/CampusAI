import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuth, EventsController.getEvents);
router.get('/:id', optionalAuth, EventsController.getEventById);
router.post('/', authenticate, requireRole(['FACULTY', 'ADMIN']), EventsController.createEvent);
router.post('/:id/rsvp', authenticate, EventsController.rsvpEvent);
router.delete('/:id', authenticate, EventsController.deleteEvent);

export default router;
