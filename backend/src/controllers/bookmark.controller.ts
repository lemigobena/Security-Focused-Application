import { Request, Response } from 'express';
import prisma from '../utils/db';
import { logAction } from '../utils/auditLogger';

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { postId } = req.body;

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      await logAction(userId, 'REMOVE_BOOKMARK', 'POST', postId, (req as any).clientIp);
      return res.status(200).json({ message: 'Bookmark removed' });
    } else {
      await prisma.bookmark.create({
        data: { userId, postId },
      });
      await logAction(userId, 'ADD_BOOKMARK', 'POST', postId, (req as any).clientIp);
      return res.status(201).json({ message: 'Bookmark added' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { username: true, profilePhotoUrl: true } },
            file: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
