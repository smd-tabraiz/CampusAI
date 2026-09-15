import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { AnalyticsService } from '../services/analytics.service';

export class AdminController {
  static async getAnalytics(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await AnalyticsService.getOverviewMetrics();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch admin analytics.' });
    }
  }

  static async getUsers(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          studentId: true,
          role: true,
          department: true,
          year: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              lostItems: true,
              foundItems: true,
              rsvps: true,
              eventsOrganized: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch users.' });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
        res.status(400).json({ error: 'Role must be STUDENT, FACULTY, or ADMIN.' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, email: true, name: true, role: true }
      });

      res.json({ message: 'User role updated successfully.', user: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update user role.' });
    }
  }

  static async getKnowledgeBase(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const entries = await prisma.knowledgeBase.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      res.json({ entries });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch knowledge base.' });
    }
  }

  static async createKnowledgeBase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, category, content, keywords } = req.body;

      if (!title || !category || !content) {
        res.status(400).json({ error: 'Title, category, and content are required.' });
        return;
      }

      const entry = await prisma.knowledgeBase.create({
        data: {
          title: title.trim(),
          category: category.toUpperCase(),
          content: content.trim(),
          keywords: keywords || title.toLowerCase()
        }
      });

      res.status(201).json({ message: 'Knowledge record created successfully.', entry });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create knowledge entry.' });
    }
  }

  static async updateKnowledgeBase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, category, content, keywords } = req.body;

      const updated = await prisma.knowledgeBase.update({
        where: { id },
        data: {
          ...(title && { title: title.trim() }),
          ...(category && { category: category.toUpperCase() }),
          ...(content && { content: content.trim() }),
          ...(keywords && { keywords })
        }
      });

      res.json({ message: 'Knowledge record updated successfully.', entry: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update knowledge record.' });
    }
  }

  static async deleteKnowledgeBase(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.knowledgeBase.delete({ where: { id } });
      res.json({ message: 'Knowledge record deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete knowledge record.' });
    }
  }
}
