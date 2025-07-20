// middleware/rateLimiter.js
import slowDown from 'express-slow-down';
import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 * 1000 / 1000) // in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Authentication rate limiter
 * 5 login attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Skip rate limiting for successful requests
  skipSuccessfulRequests: true,
  
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Password reset rate limiter
 * 3 password reset attempts per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP, please try again later.',
    retryAfter: Math.ceil(60 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Registration rate limiter
 * 3 registrations per hour per IP
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many registration attempts from this IP, please try again later.',
    retryAfter: Math.ceil(60 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * API endpoint rate limiter
 * 1000 requests per hour per IP for general API endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'API rate limit exceeded, please try again later.',
    retryAfter: Math.ceil(60 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'API rate limit exceeded, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Speed limiter (progressive delay)
 * Slows down requests instead of blocking them
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: () => 500, // Fixed: Use function for new behavior
  maxDelayMs: 20000, // maximum delay of 20 seconds
  
  // Removed deprecated onLimitReached option
  validate: {
    delayMs: false // Disable delayMs validation warning
  }
});

/**
 * User-specific rate limiter
 * Limits based on user ID instead of IP
 */
export const userBasedLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user ? `user:${req.user.id}` : req.ip;
    },
    message: {
      success: false,
      message: 'Too many requests from this user, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests from this user, please try again later.',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      });
    }
  });
};

/**
 * Custom rate limiter factory
 */
export const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      message: 'Rate limit exceeded, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Rate limiter for file uploads
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again later.',
    retryAfter: Math.ceil(60 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many file uploads from this IP, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Default export for backward compatibility
export default {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  apiLimiter,
  speedLimiter,
  userBasedLimiter,
  createCustomLimiter,
  uploadLimiter
};