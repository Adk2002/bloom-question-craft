// routes/profileRoutes.js
import express from 'express';
import profileController from '../controllers/profileController.js';
import { authMiddleware } from '../auth/middleware/authMiddleware.js'; // Updated import

const router = express.Router();

// Upload profile picture
router.post('/upload-picture', authMiddleware, profileController.uploadProfilePicture);

// Get user profile
router.get('/profile', authMiddleware, profileController.getProfile);

// Delete profile picture
router.delete('/delete-picture', authMiddleware, profileController.deleteProfilePicture);

// Update profile
router.put('/update', authMiddleware, profileController.updateProfile);

export default router;