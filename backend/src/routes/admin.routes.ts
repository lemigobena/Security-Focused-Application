import { Router } from 'express';
import { getLogs, deletePost } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

const router = Router();

// Apply authentication and RBAC to all admin routes
router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/logs', getLogs);
router.delete('/posts/:id', deletePost);

export default router;
