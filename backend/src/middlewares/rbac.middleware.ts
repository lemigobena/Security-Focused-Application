import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `RBAC violation: User ${req.user.id} (${req.user.role}) attempted to access restricted route.`
      );
      res.status(403).json({ error: 'Forbidden, insufficient permissions' });
      return;
    }

    next();
  };
};
