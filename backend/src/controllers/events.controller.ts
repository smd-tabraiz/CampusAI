import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

export class EventsController {
  static async getEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { category, filter, search } = req.query;

      const where: any = {};

      if (category && typeof category === 'string' && category !== 'ALL') {
        where.category = category.toUpperCase();
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
          { locationName: { contains: search } },
          { organizerName: { contains: search } }
        ];
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (filter === 'today') {
        where.date = todayStr;
      } else if (filter === 'upcoming') {
        where.date = { gte: todayStr };
      }

      const events = await prisma.event.findMany({
        where,
        include: {
          rsvps: {
            select: { userId: true, status: true }
          }
        },
        orderBy: { date: 'asc' }
      });

      // Mark whether current user has RSVP'd
      const currentUserId = req.user?.id;
      const formattedEvents = events.map(ev => {
        const isRegistered = currentUserId ? ev.rsvps.some(r => r.userId === currentUserId && r.status === 'REGISTERED') : false;
        return {
          ...ev,
          rsvpsCount: ev.rsvps.filter(r => r.status === 'REGISTERED').length,
          isUserRegistered: isRegistered
        };
      });

      res.json({ events: formattedEvents });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch events.' });
    }
  }

  static async getEventById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          rsvps: {
            include: {
              user: {
                select: { id: true, name: true, department: true, avatarUrl: true }
              }
            }
          },
          location: true
        }
      });

      if (!event) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }

      const isRegistered = req.user ? event.rsvps.some(r => r.userId === req.user?.id && r.status === 'REGISTERED') : false;

      res.json({
        event: {
          ...event,
          rsvpsCount: event.rsvps.filter(r => r.status === 'REGISTERED').length,
          isUserRegistered: isRegistered
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch event.' });
    }
  }

  static async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const {
        title,
        description,
        category,
        date,
        startTime,
        endTime,
        locationName,
        maxParticipants,
        isFree,
        imageUrl,
        registrationLink
      } = req.body;

      if (!title || !category || !date || !locationName) {
        res.status(400).json({ error: 'Title, category, date, and location are required.' });
        return;
      }

      const event = await prisma.event.create({
        data: {
          title: title.trim(),
          description: description || '',
          category: category.toUpperCase(),
          date,
          startTime: startTime || '10:00 AM',
          endTime: endTime || '12:00 PM',
          locationName: locationName.trim(),
          organizerName: req.user.name,
          organizerId: req.user.id,
          maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : 100,
          isFree: isFree !== false,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          registrationLink: registrationLink || null
        }
      });

      res.status(201).json({ message: 'Event created successfully.', event });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create event.' });
    }
  }

  static async rsvpEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized. Please log in to RSVP.' });
        return;
      }

      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id }
      });

      if (!event) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }

      const existingRsvp = await prisma.eventRsvp.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: req.user.id
          }
        }
      });

      if (existingRsvp) {
        // Toggle RSVP or update
        if (existingRsvp.status === 'REGISTERED') {
          await prisma.eventRsvp.delete({
            where: { id: existingRsvp.id }
          });
          res.json({ message: 'RSVP cancelled.', isRegistered: false });
        } else {
          await prisma.eventRsvp.update({
            where: { id: existingRsvp.id },
            data: { status: 'REGISTERED' }
          });
          res.json({ message: 'Registered for event!', isRegistered: true });
        }
      } else {
        await prisma.eventRsvp.create({
          data: {
            eventId: id,
            userId: req.user.id,
            status: 'REGISTERED'
          }
        });

        // Add confirmation notification
        await prisma.notification.create({
          data: {
            userId: req.user.id,
            title: `🎟️ RSVP Confirmed: ${event.title}`,
            message: `You are confirmed for ${event.title} on ${event.date} at ${event.locationName}.`,
            type: 'EVENT',
            linkUrl: '/events'
          }
        });

        res.status(201).json({ message: 'Registered for event!', isRegistered: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update RSVP.' });
    }
  }

  static async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { id } = req.params;
      const event = await prisma.event.findUnique({ where: { id } });

      if (!event) {
        res.status(404).json({ error: 'Event not found.' });
        return;
      }

      if (event.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden. Only the organizer or admin can delete this event.' });
        return;
      }

      await prisma.event.delete({ where: { id } });
      res.json({ message: 'Event deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete event.' });
    }
  }
}
