"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const ai_service_1 = require("../ai/ai.service");
const intent_classifier_1 = require("../ai/intent.classifier");
const prisma_1 = require("../utils/prisma");
class AiController {
    static async chat(req, res) {
        try {
            const { message, conversationId } = req.body;
            if (!message || typeof message !== 'string') {
                res.status(400).json({ error: 'Message content is required.' });
                return;
            }
            const user = req.user;
            let activeConversationId = conversationId;
            // If user is logged in, attach or create conversation
            if (user) {
                if (!activeConversationId) {
                    const newConvo = await prisma_1.prisma.aiConversation.create({
                        data: {
                            userId: user.id,
                            title: message.slice(0, 35) + (message.length > 35 ? '...' : '')
                        }
                    });
                    activeConversationId = newConvo.id;
                }
                // Save User Message
                await prisma_1.prisma.aiMessage.create({
                    data: {
                        conversationId: activeConversationId,
                        sender: 'USER',
                        content: message
                    }
                });
            }
            // Fetch brief conversation history
            let history = [];
            if (activeConversationId) {
                const past = await prisma_1.prisma.aiMessage.findMany({
                    where: { conversationId: activeConversationId },
                    take: 6,
                    orderBy: { createdAt: 'desc' }
                });
                history = past.reverse().map(m => ({ sender: m.sender, content: m.content }));
            }
            // Process message via AI Service Orchestrator
            const response = await ai_service_1.aiService.processMessage(message, {
                userId: user?.id,
                userName: user?.name,
                role: user?.role,
                department: user?.department,
                year: user?.year
            }, history);
            // If conversation exists, save Assistant response
            if (activeConversationId && user) {
                await prisma_1.prisma.aiMessage.create({
                    data: {
                        conversationId: activeConversationId,
                        sender: 'ASSISTANT',
                        content: response.message,
                        intent: response.intent,
                        structuredData: response.cards ? JSON.stringify({ cards: response.cards }) : null
                    }
                });
            }
            res.json({
                conversationId: activeConversationId,
                ...response
            });
        }
        catch (error) {
            console.error('AI Chat Error:', error);
            res.status(500).json({ error: error.message || 'Failed to process AI chat message.' });
        }
    }
    static async classifyIntent(req, res) {
        try {
            const { text } = req.body;
            if (!text) {
                res.status(400).json({ error: 'Text query is required.' });
                return;
            }
            const result = intent_classifier_1.IntentClassifier.classify(text);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to classify intent.' });
        }
    }
    static async getConversations(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const conversations = await prisma_1.prisma.aiConversation.findMany({
                where: { userId: req.user.id },
                orderBy: { updatedAt: 'desc' },
                include: {
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        select: { content: true, createdAt: true }
                    }
                }
            });
            res.json({ conversations });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to retrieve conversations.' });
        }
    }
    static async getConversation(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const { id } = req.params;
            const conversation = await prisma_1.prisma.aiConversation.findFirst({
                where: { id, userId: req.user.id },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
            if (!conversation) {
                res.status(404).json({ error: 'Conversation not found.' });
                return;
            }
            res.json({ conversation });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to retrieve conversation.' });
        }
    }
    static async createConversation(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized.' });
                return;
            }
            const { title } = req.body;
            const conversation = await prisma_1.prisma.aiConversation.create({
                data: {
                    userId: req.user.id,
                    title: title || 'New Campus Inquiry'
                }
            });
            res.status(201).json({ conversation });
        }
        catch (error) {
            res.status(500).json({ error: error.message || 'Failed to create conversation.' });
        }
    }
}
exports.AiController = AiController;
