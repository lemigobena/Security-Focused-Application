import { Request, Response } from 'express';
import prisma from '../utils/db';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!(req as any).file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileData = (req as any).file;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newFile = await prisma.file.create({
      data: {
        filename: fileData.originalname,
        mimetype: fileData.mimetype,
        size: fileData.size,
        path: fileData.path, // This will be the Cloudinary URL
        uploaderId: userId,
      },
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getMyFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const files = await prisma.file.findMany({
      where: { uploaderId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(files);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const file = await prisma.file.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.uploaderId !== userId && (req as any).user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.file.delete({
      where: { id: parseInt(id as string) },
    });

    // Note: In a production app, you might also want to delete from Cloudinary
    // but for now, we'll just delete the database record.

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
