import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import axios from 'axios';

const router = express.Router();

// Create chat message
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { documentId, message, response } = req.body;

    if (!message || !response) {
      return res.status(400).json({ error: 'Message and response are required' });
    }

    const chat = await prisma.chat.create({
      data: {
        userId,
        documentId: documentId || null,
        message,
        response,
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get chat history
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { documentId } = req.query;

    const where: any = { userId };
    if (documentId) {
      where.documentId = documentId as string;
    }

    const chats = await prisma.chat.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Send message to AI
router.post('/send', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { documentId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call AI service
    const aiApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiApiUrl}/ai/chat`, {
      documentId: documentId || null,
      message,
      userId,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Send chat error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;

