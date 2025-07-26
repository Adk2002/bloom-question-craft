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
router.delete('/:pyqId', authMiddleware, pyqController.deletePYQ, async (req, res) => {
  try {
    const { pyqId } = req.params;
    const userId = req.user.id; // This is set by authMiddleware

    if (!pyqId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const result = await pyqService.getPYQById(pyqId, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'PYQ not found or unauthorized'
      });
    }

    await pyqService.deletePYQ(pyqId, userId);

    res.json({
      success: true,
      message: 'PYQ deleted successfully'
    });

  } catch (error) {
    console.error('Delete PYQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting PYQ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;