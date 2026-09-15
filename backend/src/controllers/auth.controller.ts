import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, studentId, department, year, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password, and name are required.' });
        return;
      }

      // College email validation
      const emailLower = email.toLowerCase().trim();
      const isEdu = emailLower.endsWith('.edu') || emailLower.endsWith('.ac.in') || emailLower.includes('@college.');
      if (!isEdu && process.env.NODE_ENV === 'production') {
        res.status(400).json({ error: 'Please register with a valid college institutional email (e.g. name@college.edu).' });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: emailLower }
      });

      if (existingUser) {
        res.status(409).json({ error: 'An account with this college email already exists. Please log in.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const assignedRole = role === 'FACULTY' ? 'FACULTY' : 'STUDENT';

      const user = await prisma.user.create({
        data: {
          email: emailLower,
          passwordHash,
          name: name.trim(),
          studentId: studentId || null,
          department: department || 'General Engineering & Science',
          year: year ? parseInt(year, 10) : 1,
          role: assignedRole,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
        },
        select: {
          id: true,
          email: true,
          name: true,
          studentId: true,
          role: true,
          department: true,
          year: true,
          avatarUrl: true,
          createdAt: true
        }
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to CampusAI! 🎓',
          message: 'Explore campus navigation, find events, discover cafeteria deals, and find great roommates with your AI companion.',
          type: 'ANNOUNCEMENT',
          linkUrl: '/assistant'
        }
      });

      res.status(201).json({
        message: 'Account created successfully.',
        token,
        user
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to register account.' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const emailLower = email.toLowerCase().trim();
      const user = await prisma.user.findUnique({
        where: { email: emailLower }
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid college email or password.' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid college email or password.' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      const { passwordHash: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: 'Login successful.',
        token,
        user: userWithoutPassword
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to log in.' });
    }
  }

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          studentId: true,
          role: true,
          department: true,
          year: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          roommateProfile: true,
          _count: {
            select: {
              notifications: { where: { isRead: false } },
              rsvps: true,
              lostItems: true,
              foundItems: true
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch user profile.' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const { name, department, year, bio, avatarUrl } = req.body;

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(department && { department }),
          ...(year && { year: parseInt(year, 10) }),
          ...(bio !== undefined && { bio }),
          ...(avatarUrl && { avatarUrl })
        },
        select: {
          id: true,
          email: true,
          name: true,
          studentId: true,
          role: true,
          department: true,
          year: true,
          avatarUrl: true,
          bio: true
        }
      });

      res.json({ message: 'Profile updated successfully.', user: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update profile.' });
    }
  }
}
