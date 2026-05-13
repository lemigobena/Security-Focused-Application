import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import logger from '../utils/logger';

interface JwtPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any; // Will hold the Prisma User without password
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({ error: 'Not authorized, no token' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'Not authorized, user not found' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ error: 'Your account has been suspended' });
      return;
    }

    if (!user.agreedToTerms) {
      res.status(401).json({ error: 'You must agree to the terms of use' });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    // Attach client IP for audit logging, respecting shareIP setting
    (req as any).clientIp = user.shareIP ? (req.ip || req.socket.remoteAddress) : 'REDACTED';

    next();
  } catch (error) {
    logger.error(`Authentication error: ${(error as Error).message}`);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
