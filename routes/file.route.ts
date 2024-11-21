import express from 'express';
import { upload } from '../config/multer';
import { uploadFile } from '../controllers/uploadFile.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
const router = express.Router();

router.post('/', upload.single('file'), authenticateToken, uploadFile);

export default router;
