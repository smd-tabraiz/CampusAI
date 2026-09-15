"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_1 = require("../utils/prisma");
const analytics_service_1 = require("../services/analytics.service");
class AdminController {
    static async getAnalytics(_req, res) {
        try {
            const data = await analytics_service_1.AnalyticsService.getOverviewMetrics();
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch admin analytics.' });
        }
    }
    static async getUsers(_req, res) {
        try {
            const users = await prisma_1.prisma.user.findMany({
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
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch users.' });
        }
    }
    static async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
                res.status(400).json({ error: 'Role must be STUDENT, FACULTY, or ADMIN.' });
                return;
            }
            const updated = await prisma_1.prisma.user.update({
                where: { id },
                data: { role },
                select: { id: true, email: true, name: true, role: true }
            });
            res.json({ message: 'User role updated successfully.', user: updated });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to update user role.' });
        }
    }
    static async getKnowledgeBase(_req, res) {
        try {
            const entries = await prisma_1.prisma.knowledgeBase.findMany({
                orderBy: { updatedAt: 'desc' }
            });
            res.json({ entries });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch knowledge base.' });
        }
    }
    static async createKnowledgeBase(req, res) {
        try {
            const { title, category, content, keywords } = req.body;
            if (!title || !category || !content) {
                res.status(400).json({ error: 'Title, category, and content are required.' });
                return;
            }
            const entry = await prisma_1.prisma.knowledgeBase.create({
                data: {
                    title: title.trim(),
                    category: category.toUpperCase(),
                    content: content.trim(),
                    keywords: keywords || title.toLowerCase()
                }
            });
            res.status(201).json({ message: 'Knowledge record created successfully.', entry });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to create knowledge entry.' });
        }
    }
    static async updateKnowledgeBase(req, res) {
        try {
            const { id } = req.params;
            const { title, category, content, keywords } = req.body;
            const updated = await prisma_1.prisma.knowledgeBase.update({
                where: { id },
                data: {
                    ...(title && { title: title.trim() }),
                    ...(category && { category: category.toUpperCase() }),
                    ...(content && { content: content.trim() }),
                    ...(keywords && { keywords })
                }
            });
            res.json({ message: 'Knowledge record updated successfully.', entry: updated });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to update knowledge record.' });
        }
    }
    static async deleteKnowledgeBase(req, res) {
        try {
            const { id } = req.params;
            await prisma_1.prisma.knowledgeBase.delete({ where: { id } });
            res.json({ message: 'Knowledge record deleted successfully.' });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to delete knowledge record.' });
        }
    }
}
exports.AdminController = AdminController;
