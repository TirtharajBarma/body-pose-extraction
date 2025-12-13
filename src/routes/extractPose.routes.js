import express from 'express';
import { extractPose } from '../controllers/extractPose.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/extract-pose', upload.single('image'), extractPose);

export default router;
