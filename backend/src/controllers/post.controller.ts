import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { logAction } from '../utils/auditLogger';

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, fileType } = req.query;

    const where: any = {
      isSuspended: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { body: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (fileType) {
      where.file = {
        mimetype: { contains: fileType as string, mode: 'insensitive' },
      };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, username: true, profilePhotoUrl: true },
        },
        file: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Simple social link recognition (TikTok, YouTube, Instagram)
    const socialRegex = /(https?:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com|instagram\.com)\/[^\s]+)/g;

    const formattedPosts = posts.map((post) => {
      const links = post.body?.match(socialRegex) || [];
      return { ...post, detectedLinks: links };
    });

    res.json(formattedPosts);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, body, fileId } = req.body;
    
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validation: At least 2 fields must be filled (title, body, fileId)
    const filledFields = [title, body, fileId].filter(f => f !== undefined && f !== null && f !== '').length;
    if (filledFields < 2) {
      res.status(400).json({ error: 'At least two fields (title, description, or file) must be filled.' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        title,
        body,
        fileId: fileId ? parseInt(fileId) : null,
        authorId: req.user.id,
      },
    });

    await logAction(req.user.id, 'CREATE_POST', 'POST', post.id, (req as any).clientIp);

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const getActiveUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        posts: {
          some: {
            isSuspended: false,
          },
        },
        isSuspended: false,
      },
      select: {
        id: true,
        username: true,
        profilePhotoUrl: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
