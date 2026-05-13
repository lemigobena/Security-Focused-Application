import { Router } from 'express';
import { getProfile, updateProfile, updateSettings, deleteAccount, updatePassword } from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public profile view
router.get('/:username', getProfile);

// Authenticated profile actions
router.use(authenticate);
router.patch('/me', updateProfile);
router.patch('/settings', updateSettings);
router.patch('/password', updatePassword);
router.delete('/me', deleteAccount);

export default router;
