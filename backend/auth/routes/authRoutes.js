// auth/routes/authRoutes.js
import express from 'express';
import {authLimiter, registrationLimiter, passwordResetLimiter} from '../middleware/rateLimiter.js';
import {validateLogin, validateSignup, validatePasswordResetRequest } from '../middleware/validation.js';
import authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';  // ← Changed this line

const router = express.Router();

// Apply rate limiting and validation to auth routes
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/signup', registrationLimiter, validateSignup, authController.signup);
router.post('/forgot-password', passwordResetLimiter, validatePasswordResetRequest, authController.forgotPassword);
router.post('/logout', authMiddleware, authController.logout);

export default router;