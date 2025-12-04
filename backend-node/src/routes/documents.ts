import express from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { minioClient, BUCKET_NAME, ensureBucket } from '../lib/minio';
import axios from 'axios';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Ensure bucket on startup
ensureBucket().catch(console.error);

// Upload document
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.userId!;
      const file = req.file;
      const fileKey = `${userId}/${randomUUID()}-${file.originalname}`;

      // Upload to MinIO
      await minioClient.putObject(
        BUCKET_NAME,
        fileKey,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      // Get file URL
      const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${fileKey}`;

      // Determine document type
      let documentType: 'PDF' | 'AUDIO' | 'VIDEO' | 'TEXT' = 'TEXT';
      if (file.mimetype === 'application/pdf') {
        documentType = 'PDF';
      } else if (file.mimetype.startsWith('audio/')) {
        documentType = 'AUDIO';
      } else if (file.mimetype.startsWith('video/')) {
        documentType = 'VIDEO';
      }

      // Create document record
      const document = await prisma.document.create({
        data: {
          userId,
          title: file.originalname,
          type: documentType,
          fileUrl,
          fileKey,
          mimeType: file.mimetype,
          fileSize: file.size,
          status: 'PROCESSING',
        },
      });

      // Trigger AI processing based on type
      const aiApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      
      if (documentType === 'PDF') {
        // Process PDF in background
        axios
          .post(`${aiApiUrl}/ai/summarize-pdf`, {
            documentId: document.id,
            fileUrl,
            fileKey,
          })
          .catch(console.error);
      } else if (documentType === 'AUDIO' || documentType === 'VIDEO') {
        // Process audio/video in background
        axios
          .post(`${aiApiUrl}/ai/transcribe`, {
            documentId: document.id,
            fileUrl,
            fileKey,
            mimeType: file.mimetype,
          })
          .catch(console.error);
      }

      res.status(201).json(document);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

// Get all documents for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update document (called by AI service)
router.post('/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from MinIO
    await minioClient.removeObject(BUCKET_NAME, document.fileKey);

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;

