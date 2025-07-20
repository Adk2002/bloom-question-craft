// routes/userRoutes.js

import { authMiddleware, requireRole, requireOwnership } from '../middleware/authMiddleware';
import { apiLimiter, userBasedLimiter } from '../middleware/rateLimiter';
import { validateProfileUpdate, userIdValidation } from '../middleware/validation';

const router = express.Router();

// Protected user routes
router.get('/profile', authMiddleware, apiLimiter, userController.getProfile);
router.put('/profile', authMiddleware, validateProfileUpdate, userController.updateProfile);
router.get('/:userId', authMiddleware, userIdValidation, requireOwnership('userId'), userController.getUser);

// Admin only routes
router.get('/all', authMiddleware, requireRole('admin'), userBasedLimiter(15 * 60 * 1000, 200), userController.getAllUsers);

export default router;