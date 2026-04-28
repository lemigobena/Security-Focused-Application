import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
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
    const { title, body } = req.body;
    
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    const post = await prisma.post.create({
      data: {
        title,
        body,
        authorId: req.user.id,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};
