import { Router } from 'express';
import { getPosts, createPost, getActiveUsers } from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createPostSchema } from '../schemas/post.schema';

const router = Router();

router.get('/', getPosts);
router.get('/active-users', getActiveUsers);
router.post('/', authenticate, validateRequest(createPostSchema), createPost);

export default router;
