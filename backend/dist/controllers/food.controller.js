"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodController = void 0;
const prisma_1 = require("../utils/prisma");
class FoodController {
    static async getCafeterias(_req, res) {
        try {
            const cafeterias = await prisma_1.prisma.cafeteria.findMany({
                include: {
                    foodItems: {
                        take: 4,
                        orderBy: { popularScore: 'desc' }
                    }
                },
                orderBy: { rating: 'desc' }
            });
            res.json({ cafeterias });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch cafeterias.' });
        }
    }
    static async getCafeteriaDetails(req, res) {
        try {
            const { id } = req.params;
            const cafeteria = await prisma_1.prisma.cafeteria.findUnique({
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
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch cafeteria details.' });
        }
    }
    static async getFoodRecommendations(req, res) {
        try {
            const { maxBudget, diet, category, search } = req.query;
            const where = {};
            if (maxBudget) {
                where.price = { lte: parseFloat(String(maxBudget)) };
            }
            if (diet === 'veg') {
                where.isVeg = true;
            }
            else if (diet === 'vegan') {
                where.isVegan = true;
            }
            else if (diet === 'healthy') {
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
            const items = await prisma_1.prisma.foodItem.findMany({
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
                const reasons = [];
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
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to generate food recommendations.' });
        }
    }
    static async getAllFoodItems(req, res) {
        try {
            const items = await prisma_1.prisma.foodItem.findMany({
                include: {
                    cafeteria: { select: { name: true, locationName: true } }
                },
                orderBy: { popularScore: 'desc' }
            });
            res.json({ items });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch food items.' });
        }
    }
}
exports.FoodController = FoodController;
