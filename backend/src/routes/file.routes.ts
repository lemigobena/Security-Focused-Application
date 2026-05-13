import { Router } from 'express';
import { uploadFile, getMyFiles, deleteFile } from '../controllers/file.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// All file routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/my-files', getMyFiles);
router.delete('/:id', deleteFile);

export default router;
