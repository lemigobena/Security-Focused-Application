import { Router } from 'express';
import { getDashboardStats, getAuditLogs, suspendUser, suspendPost, getUsers } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Apply authentication and RBAC to all admin routes
router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/stats', getDashboardStats);
router.get('/logs', getAuditLogs);
router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/posts/:id/suspend', suspendPost);

export default router;
