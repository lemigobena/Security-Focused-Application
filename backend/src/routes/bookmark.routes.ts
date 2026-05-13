import { Router } from 'express';
import { toggleBookmark, getBookmarks } from '../controllers/bookmark.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/toggle', toggleBookmark);
router.get('/my-bookmarks', getBookmarks);

export default router;
