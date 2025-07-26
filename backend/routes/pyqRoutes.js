import express from 'express';
import { authMiddleware } from '../auth/middleware/authMiddleware.js';
import { uploadPYQ } from '../config/upload.js';
import { PYQController } from '../controllers/pyqController.js';

const router = express.Router();
const pyqController = new PYQController();

// GET /api/pyq/my-pyqs - Get user's PYQ files
router.get('/my-pyqs', authMiddleware, pyqController.getUserPYQs);

// POST /api/pyq/upload - Upload PYQ files
router.post('/upload', 
  authMiddleware, 
  uploadPYQ.array('pyqFiles', 5),
  pyqController.uploadPYQFiles
);

// GET /api/pyq/:pyqId - Get specific PYQ details
router.get('/:pyqId', authMiddleware, pyqController.getPYQDetails);

// DELETE /api/pyq/:pyqId - Delete PYQ
router.delete('/:pyqId', authMiddleware, pyqController.deletePYQ);

export default router;