// middleware/validation.js
import {body, param, query, validationResult} from 'express-validator'

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * Email validation rules
 */
export const emailValidation = () => [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters')
];

/**
 * Password validation rules
 */
export const passwordValidation = () => [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

/**
 * Name validation rules
 */
export const nameValidation = () => [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
];

/**
 * User ID parameter validation
 */
export const userIdValidation = () => [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
    .toInt()
];

/**
 * Login validation
 */
export const validateLogin = [
  ...emailValidation(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters'),
  handleValidationErrors
];

/**
 * Signup validation
 */
export const validateSignup = [
  ...emailValidation(),
  ...passwordValidation(),
  ...nameValidation(),
  
  // // Optional: Confirm password
  // body('confirmPassword')
  //   .custom((value, { req }) => {
  //     if (value !== req.body.password) {
  //       throw new Error('Password confirmation does not match password');
  //     }
  //     return true;
  //   })
  //   .optional(),
  
  // handleValidationErrors
];

/**
 * Password reset request validation
 */
export const validatePasswordResetRequest = [
  ...emailValidation(),
  handleValidationErrors
];

/**
 * Password reset validation
 */
export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Invalid reset token format'),
  
  ...passwordValidation(),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Profile update validation
 */
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  
  handleValidationErrors
];

/**
 * Change password validation
 */
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .isLength({ max: 128 })
    .withMessage('New password must be less than 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Query pagination validation
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  handleValidationErrors
];

/**
 * Generic text validation
 */
export const validateText = (fieldName, minLength = 1, maxLength = 500) => [
  body(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
    .escape(), // Prevent XSS
  
  handleValidationErrors
];

/**
 * File upload validation
 */
export const validateFileUpload = (fieldName, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB'
      });
    }

    next();
  };
};

/**
 * Sanitize input middleware
 */
export const sanitizeInput = (req, res, next) => {
  // Remove potential XSS and SQL injection attempts
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        obj[key] = obj[key].replace(/javascript:/gi, '');
        obj[key] = obj[key].replace(/on\w+=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

export default  {
  handleValidationErrors,
  validateLogin,
  validateSignup,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateProfileUpdate,
  validateChangePassword,
  validatePagination,
  validateText,
  validateFileUpload,
  sanitizeInput,
  userIdValidation
};