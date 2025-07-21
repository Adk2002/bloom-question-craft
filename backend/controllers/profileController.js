// profileController.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../(database)/db.js';

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads/profiles';
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp.ext
    const userId = req.user.id || 'temp';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 12 * 1024 * 1024 // 5MB limit
  }
});

const profileController = {
  // Upload profile picture
  uploadProfilePicture: [
    upload.single('profilePicture'), // middleware for handling file upload
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'No file uploaded' 
          });
        }

        const userId = req.user.id; // from JWT middleware
        const filePath = `/uploads/profiles/${req.file.filename}`;

        // Delete old profile picture if exists
        const oldUser = await db.query('SELECT "profileImage" FROM "User" WHERE id = $1', [userId]);
        if (oldUser.rows.length > 0 && oldUser.rows[0].profileImage) {
          const oldImagePath = path.join('.', oldUser.rows[0].profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Update user's profile image path in database
        const result = await db.query(
          'UPDATE "User" SET "profileImage" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, "profileImage"',
          [filePath, userId]
        );

        if (result.rows.length === 0) {
          // If update failed, delete the uploaded file
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        const user = result.rows[0];

        res.status(200).json({
          success: true,
          message: 'Profile picture uploaded successfully',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            profileImage: user.profileImage
          },
          imageUrl: filePath
        });

      } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            message: 'File too large. Maximum size is 5MB.' 
          });
        }

        res.status(500).json({ 
          success: false, 
          message: 'Error uploading profile picture' 
        });
      }
    }
  ],

  //update profile

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, phoneNumber, institution, department } = req.body;
      const result = await db.query(
        'UPDATE "User" SET name = $1, "phoneNumber" = $2, institution = $3, department = $4, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, "phoneNumber", institution, department',
        [name, phoneNumber, institution, department, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, user: result.rows[0] });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  },

  // Get user profile with image
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await db.query(
        'SELECT id, email, name, role, "profileImage", department, institution, "phoneNumber" FROM "User" WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const user = result.rows[0];

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage,
          department: user.department,
          institution: user.institution,
          phoneNumber: user.phoneNumber
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching profile' 
      });
    }
  },

  // Delete profile picture
  deleteProfilePicture: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get current profile image path
      const user = await db.query('SELECT "profileImage" FROM "User" WHERE id = $1', [userId]);
      
      if (user.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const currentImage = user.rows[0].profileImage;

      // Delete file from filesystem
      if (currentImage) {
        const imagePath = path.join('.', currentImage);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Remove profile image path from database
      await db.query(
        'UPDATE "User" SET "profileImage" = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );

      res.status(200).json({
        success: true,
        message: 'Profile picture deleted successfully'
      });

    } catch (error) {
      console.error('Delete profile picture error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting profile picture' 
      });
    }
  }
};

export default profileController;