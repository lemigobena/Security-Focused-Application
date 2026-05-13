import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { logAction } from '../utils/auditLogger';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Basic stats for graphs
    const postCount = await prisma.post.count();
    const userCount = await prisma.user.count();
    const bookmarkCount = await prisma.bookmark.count();
    const fileCount = await prisma.file.count();

    // Grouping actions by type for a dashboard graph
    const actionStats = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        _all: true,
      },
    });

    // Recent activity trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActions = await prisma.auditLog.findMany({
      where: { timestamp: { gte: sevenDaysAgo } },
      orderBy: { timestamp: 'asc' },
    });

    res.status(200).json({
      summary: { postCount, userCount, bookmarkCount, fileCount },
      actionStats,
      recentActions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { category } = req.query; // e.g., 'LOGIN', 'POST', 'USER'

    const where: any = {};
    if (category) {
      if (category === 'ADMIN') {
        where.OR = [
          { action: { contains: 'ADMIN' } },
          { action: { contains: 'SUSPEND' } }
        ];
      } else {
        where.action = { contains: category as string };
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id as string) },
      data: { isSuspended: suspended },
    });

    await logAction((req as any).user.id, suspended ? 'ADMIN_SUSPEND_USER' : 'ADMIN_UNSUSPEND_USER', 'USER', user.id, (req as any).clientIp);

    res.status(200).json({ message: `User ${suspended ? 'suspended' : 'unsuspended'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const suspendPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;

    const post = await prisma.post.update({
      where: { id: parseInt(req.params.id as string) },
      data: { isSuspended: suspended },
    });

    await logAction((req as any).user.id, suspended ? 'ADMIN_SUSPEND_POST' : 'ADMIN_UNSUSPEND_POST', 'POST', post.id, (req as any).clientIp);

    res.status(200).json({ message: `Post ${suspended ? 'suspended' : 'unsuspended'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        agreedToTerms: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
