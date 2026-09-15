import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export class FoodController {
  static async getCafeterias(_req: Request, res: Response): Promise<void> {
    try {
      const cafeterias = await prisma.cafeteria.findMany({
        include: {
          foodItems: {
            take: 4,
            orderBy: { popularScore: 'desc' }
          }
        },
        orderBy: { rating: 'desc' }
      });
      res.json({ cafeterias });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch cafeterias.' });
    }
  }

  static async getCafeteriaDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cafeteria = await prisma.cafeteria.findUnique({
        where: { id },
        include: {
          foodItems: {
            orderBy: { popularScore: 'desc' }
          }
        }
      });

      if (!cafeteria) {
        res.status(404).json({ error: 'Cafeteria not found.' });
        return;
      }

      res.json({ cafeteria });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch cafeteria details.' });
    }
  }

  static async getFoodRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { maxBudget, diet, category, search } = req.query;

      const where: any = {};

      if (maxBudget) {
        where.price = { lte: parseFloat(String(maxBudget)) };
      }

      if (diet === 'veg') {
        where.isVeg = true;
      } else if (diet === 'vegan') {
        where.isVegan = true;
      } else if (diet === 'healthy') {
        where.isHealthy = true;
      }

      if (category && typeof category === 'string' && category !== 'ALL') {
        where.category = category.toUpperCase();
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const items = await prisma.foodItem.findMany({
        where,
        include: {
          cafeteria: {
            select: { id: true, name: true, locationName: true, rating: true, openingHours: true }
          }
        },
        orderBy: { popularScore: 'desc' },
        take: 20
      });

      // Augment each item with "Why this recommendation" explanation
      const recommendations = items.map(item => {
        const reasons: string[] = [];
        if (maxBudget && item.price <= parseFloat(String(maxBudget))) {
          reasons.push(`Within ₹${maxBudget} budget (Costs ₹${item.price})`);
        }
        if (item.isHealthy) {
          reasons.push('Nutrient-dense & clean eating option');
        }
        if (item.isVeg) {
          reasons.push('Pure vegetarian');
        }
        if (item.popularScore >= 4.7) {
          reasons.push(`Top student rating (${item.popularScore}★)`);
        }

        const whyRecommended = reasons.length > 0
          ? `Recommended because: ${reasons.join(' • ')}.`
          : `Popular choice at ${item.cafeteria.name}.`;

        return {
          ...item,
          whyRecommended
        };
      });

      res.json({ recommendations });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to generate food recommendations.' });
    }
  }

  static async getAllFoodItems(req: Request, res: Response): Promise<void> {
    try {
      const items = await prisma.foodItem.findMany({
        include: {
          cafeteria: { select: { name: true, locationName: true } }
        },
        orderBy: { popularScore: 'desc' }
      });
      res.json({ items });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch food items.' });
    }
  }
}
