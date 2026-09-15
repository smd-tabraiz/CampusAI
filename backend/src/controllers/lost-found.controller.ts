import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import { MatchingService } from '../services/matching.service';

export class LostFoundController {
  static async getItems(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type, category, status } = req.query;

      const lostWhere: any = {};
      const foundWhere: any = {};

      if (category && typeof category === 'string' && category !== 'ALL') {
        lostWhere.category = category.toUpperCase();
        foundWhere.category = category.toUpperCase();
      }

      if (status && typeof status === 'string') {
        lostWhere.status = status.toUpperCase();
        foundWhere.status = status.toUpperCase();
      } else {
        lostWhere.status = 'ACTIVE';
        foundWhere.status = 'ACTIVE';
      }

      const [lostItems, foundItems] = await Promise.all([
        type === 'found' ? [] : prisma.lostItem.findMany({
          where: lostWhere,
          include: {
            user: { select: { name: true, department: true, avatarUrl: true } },
            matches: {
              include: { foundItem: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        type === 'lost' ? [] : prisma.foundItem.findMany({
          where: foundWhere,
          include: {
            user: { select: { name: true, department: true, avatarUrl: true } },
            matches: {
              include: { lostItem: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      res.json({ lostItems, foundItems });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch lost and found items.' });
    }
  }

  static async reportLost(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { title, category, description, color, lostDate, locationName, imageUrl, contactPreference } = req.body;

      if (!title || !category || !description || !locationName) {
        res.status(400).json({ error: 'Title, category, description, and location are required.' });
        return;
      }

      const lostItem = await prisma.lostItem.create({
        data: {
          userId: req.user.id,
          title: title.trim(),
          category: category.toUpperCase(),
          description: description.trim(),
          color: color || 'Unspecified',
          lostDate: lostDate || new Date().toISOString().split('T')[0],
          locationName: locationName.trim(),
          imageUrl: imageUrl || null,
          contactPreference: contactPreference || 'IN_APP',
          status: 'ACTIVE'
        }
      });

      // AI Match Execution: check all active found items
      const activeFound = await prisma.foundItem.findMany({
        where: { status: 'ACTIVE' }
      });

      const matchesCreated: any[] = [];
      for (const found of activeFound) {
        const matchResult = MatchingService.calculateItemMatch(
          {
            title: lostItem.title,
            description: lostItem.description,
            category: lostItem.category,
            color: lostItem.color,
            locationName: lostItem.locationName,
            lostDate: lostItem.lostDate
          },
          {
            title: found.title,
            description: found.description,
            category: found.category,
            color: found.color,
            locationName: found.locationName,
            foundDate: found.foundDate
          }
        );

        if (matchResult.confidenceScore >= 60) {
          const match = await prisma.itemMatch.create({
            data: {
              lostItemId: lostItem.id,
              foundItemId: found.id,
              confidenceScore: matchResult.confidenceScore,
              matchReason: matchResult.matchReason,
              status: 'PENDING'
            },
            include: { foundItem: true }
          });
          matchesCreated.push(match);
        }
      }

      // If matches found, generate an immediate notification
      if (matchesCreated.length > 0) {
        const topMatch = matchesCreated.sort((a, b) => b.confidenceScore - a.confidenceScore)[0];
        await prisma.notification.create({
          data: {
            userId: req.user.id,
            title: '🎯 Potential Match Detected by AI!',
            message: `Your lost "${lostItem.title}" matches a found item (${topMatch.confidenceScore}% confidence) at ${topMatch.foundItem.locationName}.`,
            type: 'MATCH',
            linkUrl: '/lost-found'
          }
        });
      }

      res.status(201).json({
        message: 'Lost item report submitted successfully.',
        item: lostItem,
        matches: matchesCreated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to submit lost item report.' });
    }
  }

  static async reportFound(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { title, category, description, color, foundDate, locationName, imageUrl, contactMethod } = req.body;

      if (!title || !category || !description || !locationName) {
        res.status(400).json({ error: 'Title, category, description, and location are required.' });
        return;
      }

      const foundItem = await prisma.foundItem.create({
        data: {
          userId: req.user.id,
          title: title.trim(),
          category: category.toUpperCase(),
          description: description.trim(),
          color: color || 'Unspecified',
          foundDate: foundDate || new Date().toISOString().split('T')[0],
          locationName: locationName.trim(),
          imageUrl: imageUrl || null,
          contactMethod: contactMethod || 'CAMPUS_SECURITY_DESK',
          status: 'ACTIVE'
        }
      });

      // AI Match Execution: check all active lost items
      const activeLost = await prisma.lostItem.findMany({
        where: { status: 'ACTIVE' },
        include: { user: true }
      });

      const matchesCreated: any[] = [];
      for (const lost of activeLost) {
        const matchResult = MatchingService.calculateItemMatch(
          {
            title: lost.title,
            description: lost.description,
            category: lost.category,
            color: lost.color,
            locationName: lost.locationName,
            lostDate: lost.lostDate
          },
          {
            title: foundItem.title,
            description: foundItem.description,
            category: foundItem.category,
            color: foundItem.color,
            locationName: foundItem.locationName,
            foundDate: foundItem.foundDate
          }
        );

        if (matchResult.confidenceScore >= 60) {
          const match = await prisma.itemMatch.create({
            data: {
              lostItemId: lost.id,
              foundItemId: foundItem.id,
              confidenceScore: matchResult.confidenceScore,
              matchReason: matchResult.matchReason,
              status: 'PENDING'
            },
            include: { lostItem: true }
          });
          matchesCreated.push(match);

          // Alert the user who lost the item
          await prisma.notification.create({
            data: {
              userId: lost.userId,
              title: '🎯 Potential Match Detected by AI!',
              message: `A found item matching your lost "${lost.title}" (${matchResult.confidenceScore}% confidence) was registered at ${foundItem.locationName}.`,
              type: 'MATCH',
              linkUrl: '/lost-found'
            }
          });
        }
      }

      res.status(201).json({
        message: 'Found item registered successfully.',
        item: foundItem,
        matches: matchesCreated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to register found item.' });
    }
  }

  static async getMatches(req: AuthRequest, res: Response): Promise<void> {
    try {
      const matches = await prisma.itemMatch.findMany({
        include: {
          lostItem: {
            include: { user: { select: { name: true, department: true } } }
          },
          foundItem: {
            include: { user: { select: { name: true, department: true } } }
          }
        },
        orderBy: { confidenceScore: 'desc' }
      });

      res.json({ matches });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch matches.' });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { type, id } = req.params;
      const { status } = req.body;

      if (type === 'lost') {
        const updated = await prisma.lostItem.update({
          where: { id },
          data: { status }
        });
        res.json({ message: 'Lost item status updated.', item: updated });
      } else if (type === 'found') {
        const updated = await prisma.foundItem.update({
          where: { id },
          data: { status }
        });
        res.json({ message: 'Found item status updated.', item: updated });
      } else {
        res.status(400).json({ error: 'Invalid item type.' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update item status.' });
    }
  }
}
