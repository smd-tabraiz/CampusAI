import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../ai/ai.service';
import { IntentClassifier } from '../ai/intent.classifier';
import { prisma } from '../utils/prisma';

export class AiController {
  static async chat(req: AuthRequest, res: Response): Promise<void> {
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
          const newConvo = await prisma.aiConversation.create({
            data: {
              userId: user.id,
              title: message.slice(0, 35) + (message.length > 35 ? '...' : '')
            }
          });
          activeConversationId = newConvo.id;
        }

        // Save User Message
        await prisma.aiMessage.create({
          data: {
            conversationId: activeConversationId,
            sender: 'USER',
            content: message
          }
        });
      }

      // Fetch brief conversation history
      let history: { sender: string; content: string }[] = [];
      if (activeConversationId) {
        const past = await prisma.aiMessage.findMany({
          where: { conversationId: activeConversationId },
          take: 6,
          orderBy: { createdAt: 'desc' }
        });
        history = past.reverse().map(m => ({ sender: m.sender, content: m.content }));
      }

      // Process message via AI Service Orchestrator
      const response = await aiService.processMessage(
        message,
        {
          userId: user?.id,
          userName: user?.name,
          role: user?.role,
          department: user?.department,
          year: user?.year
        },
        history
      );

      // If conversation exists, save Assistant response
      if (activeConversationId && user) {
        await prisma.aiMessage.create({
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
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      res.status(500).json({ error: error.message || 'Failed to process AI chat message.' });
    }
  }

  static async classifyIntent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Text query is required.' });
        return;
      }

      const result = IntentClassifier.classify(text);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to classify intent.' });
    }
  }

  static async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const conversations = await prisma.aiConversation.findMany({
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
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to retrieve conversations.' });
    }
  }

  static async getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { id } = req.params;
      const conversation = await prisma.aiConversation.findFirst({
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
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to retrieve conversation.' });
    }
  }

  static async createConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { title } = req.body;
      const conversation = await prisma.aiConversation.create({
        data: {
          userId: req.user.id,
          title: title || 'New Campus Inquiry'
        }
      });

      res.status(201).json({ conversation });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create conversation.' });
    }
  }
}
