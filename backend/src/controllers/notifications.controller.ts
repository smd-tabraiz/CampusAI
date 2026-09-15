import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';

export class NotificationsController {
  static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      const unreadCount = notifications.filter(n => !n.isRead).length;

      res.json({ notifications, unreadCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch notifications.' });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { id } = req.params;
      const updated = await prisma.notification.updateMany({
        where: { id, userId: req.user.id },
        data: { isRead: true }
      });

      res.json({ message: 'Notification marked as read.', updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to mark notification as read.' });
    }
  }

  static async markAllRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true }
      });

      res.json({ message: 'All notifications marked as read.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to mark notifications read.' });
    }
  }
}
