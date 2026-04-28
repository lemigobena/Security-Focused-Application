import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';

export const getLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to recent 100 logs
    });
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const postId = parseInt(req.params.id as string, 10);
    
    if (isNaN(postId)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    if (req.user) {
        await prisma.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'DELETE',
                entity: 'POST',
                entityId: postId,
                ip: req.ip || req.socket.remoteAddress,
            },
        });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
