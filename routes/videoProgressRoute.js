import express from 'express';
import { updateProgress, getProgress } from '../controller/videoProgressController.js';
import authUser from '../middleware/auth.js';

const videoProgressRouter = express.Router();

// Protected routes - require authentication
videoProgressRouter.post('/update', authUser, updateProgress);
videoProgressRouter.get('/:courseId/:lectureId', authUser, getProgress);

export default videoProgressRouter; 