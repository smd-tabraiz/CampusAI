"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const prisma_1 = require("../utils/prisma");
class NotificationsController {
    static async getNotifications(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const notifications = await prisma_1.prisma.notification.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
                take: 30
            });
            const unreadCount = notifications.filter(n => !n.isRead).length;
            res.json({ notifications, unreadCount });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to fetch notifications.' });
        }
    }
    static async markAsRead(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const { id } = req.params;
            const updated = await prisma_1.prisma.notification.updateMany({
                where: { id, userId: req.user.id },
                data: { isRead: true }
            });
            res.json({ message: 'Notification marked as read.', updated });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to mark notification as read.' });
        }
    }
    static async markAllRead(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            await prisma_1.prisma.notification.updateMany({
                where: { userId: req.user.id, isRead: false },
                data: { isRead: true }
            });
            res.json({ message: 'All notifications marked as read.' });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to mark notifications read.' });
        }
    }
}
exports.NotificationsController = NotificationsController;
