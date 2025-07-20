// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import db from '../../(database)/db.js';

/**
 * Main authentication middleware
 * Verifies JWT token and sets req.user
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided or invalid format.' 
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Token is required.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists in database
    const userResult = await db.query(
      'SELECT id, email, name, role, "isActive" FROM "User" WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found. Token is invalid.' 
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated.' 
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Please login again.' 
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not active yet.' 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication.' 
    });
  }
};

/**
 * Optional authentication middleware
 * Sets req.user if token is valid, but doesn't block request if not
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await db.query(
      'SELECT id, email, name, role, "isActive" FROM "User" WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0 && userResult.rows[0].isActive) {
      req.user = userResult.rows[0];
    }

    next();
  } catch (error) {
    // Don't block request on optional auth failure
    next();
  }
};

/**
 * Role-based access control middleware
 * Usage: requireRole('admin') or requireRole(['admin', 'moderator'])
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required.' 
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions. Access denied.' 
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource
 * Usage: requireOwnership('userId') - checks if req.user.id matches req.params.userId
 */
export const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required.' 
      });
    }

    const resourceUserId = req.params[paramName] || req.body[paramName];
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership
    if (req.user.id !== parseInt(resourceUserId)) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only access your own resources.' 
      });
    }

    next();
  };
};

/**
 * Token refresh middleware
 * Checks if token is about to expire and issues a new one
 */
export const refreshTokenMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const authHeader = req.header('Authorization');
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token);
    
    // Check if token expires within 15 minutes
    const expiryTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const refreshThreshold = 15 * 60 * 1000; // 15 minutes

    if (timeUntilExpiry <= refreshThreshold) {
      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: req.user.id, 
          email: req.user.email,
          role: req.user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Add new token to response headers
      res.setHeader('X-New-Token', newToken);
    }

    next();
  } catch (error) {
    console.error('Token refresh error:', error);
    next();
  }
};

export default  {
  authMiddleware,
  optionalAuth,
  requireRole,
  requireOwnership,
  refreshTokenMiddleware
};