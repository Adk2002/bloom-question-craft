import { PYQService } from '../services/pyqService.js';
import { addPYQProcessingJob } from '../queues/pyqQueue.js';
import db from '../(database)/db.js';
import path from 'path';
import { promises as fs } from 'fs';

const pyqService = new PYQService();

export class PYQController {

  // Upload multiple PYQ files
  async uploadPYQFiles(req, res) {
    try {
      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No PDF files uploaded'
        });
      }

      const userId = req.user.id;
      const uploadedPYQs = [];
      const queuedJobs = [];

      // Process each uploaded file
      for (const file of req.files) {
        try {
          // Extract metadata from request body or set defaults
          const {
            title,
            year,
            subject,
            classLevel,
            board,
            language = 'en',
            semester,
            institution,
            department,
            courseCode
          } = req.body;

          // Validate required fields
          if (!title || !year || !subject || !classLevel || !board) {
            return res.status(400).json({
              success: false,
              message: 'Missing required fields: title, year, subject, classLevel, board'
            });
          }

          // Create file URL (relative path)
          const fileUrl = `/uploads/previous-year-questions/${file.filename}`;

          // Prepare PYQ data
          const pyqData = {
            title: title || `${subject} ${year} Question Paper`,
            year: parseInt(year),
            fileUrl,
            fileName: file.originalname,
            fileSize: file.size,
            userId,
            subject,
            classLevel,
            board,
            language,
            semester,
            institution,
            department,
            courseCode
          };

          // Save to database
          const createdPYQ = await pyqService.createPYQRecord(pyqData);

          // Prepare job data for queue
          const jobData = {
            pyqId: createdPYQ.id,
            filePath: file.path,
            fileName: file.originalname,
            fileUrl,
            userId,
            subject,
            classLevel,
            board,
            year: parseInt(year),
            title: pyqData.title
          };

          // Add to processing queue
          const jobId = await addPYQProcessingJob(jobData);

          uploadedPYQs.push({
            id: createdPYQ.id,
            title: createdPYQ.title,
            fileName: file.originalname,
            fileSize: file.size,
            status: 'queued_for_processing'
          });

          queuedJobs.push({
            pyqId: createdPYQ.id,
            jobId,
            fileName: file.originalname
          });

        } catch (fileError) {
          console.error(`❌ Error processing file ${file.originalname}:`, fileError);

          // Continue with other files even if one fails
          uploadedPYQs.push({
            fileName: file.originalname,
            status: 'failed',
            error: fileError.message
          });
        }
      }

      // Return response
      res.status(201).json({
        success: true,
        message: `${uploadedPYQs.length} PYQ file(s) uploaded successfully`,
        data: {
          uploadedFiles: uploadedPYQs,
          queuedJobs: queuedJobs,
          totalUploaded: uploadedPYQs.filter(f => f.status !== 'failed').length,
          totalFailed: uploadedPYQs.filter(f => f.status === 'failed').length
        }
      });

    } catch (error) {
      console.error('❌ PYQ upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during PYQ upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's uploaded PYQs
  async getUserPYQs(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const pyqs = await pyqService.getUserPYQs(userId, parseInt(limit), offset);

      res.json({
        success: true,
        data: {
          pyqs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: pyqs.length
          }
        }
      });

    } catch (error) {
      console.error('❌ Error fetching user PYQs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching PYQ files'
      });
    }
  }

  // Get single PYQ details
  async getPYQDetails(req, res) {
    try {
      const { pyqId } = req.params;
      const userId = req.user.id;

      const pyq = await pyqService.getPYQById(pyqId, userId);

      if (!pyq) {
        return res.status(404).json({
          success: false,
          message: 'PYQ not found'
        });
      }

      res.json({
        success: true,
        data: pyq
      });

    } catch (error) {
      console.error('❌ Error fetching PYQ details:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching PYQ details'
      });
    }
  }

  // Delete PYQ file
  async deletePYQ(req, res) {
    try {
      const { pyqId } = req.params;
      const userId = req.user.id;

      // Get PYQ details first
      const pyq = await pyqService.getPYQById(pyqId, userId);

      if (!pyq) {
        return res.status(404).json({
          success: false,
          message: 'PYQ not found'
        });
      }

      // Fix the file path construction
      // Remove the leading slash from fileUrl
      const cleanFileUrl = pyq.fileUrl.replace(/^\/+/, '');
      const filePath = path.join(process.cwd(), cleanFileUrl);

      // Log the paths for debugging
      console.log('Original fileUrl:', pyq.fileUrl);
      console.log('Clean fileUrl:', cleanFileUrl);
      console.log('Final filePath:', filePath);

      try {
        await fs.access(filePath); // Check if file exists
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted file: ${filePath}`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete file: ${filePath}`, fileError.message);
      }

      // Delete from database
      await db.query('DELETE FROM "PreviousYearQuestion" WHERE id = $1', [pyqId]);

      res.json({
        success: true,
        message: 'PYQ deleted successfully'
      });

    } catch (error) {
      console.error('❌ Error deleting PYQ:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting PYQ'
      });
    }
  }
}