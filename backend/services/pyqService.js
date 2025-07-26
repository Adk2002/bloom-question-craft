import db from '../(database)/db.js'
import { v4 as uuidv4 } from 'uuid';

export class PYQService {

  // Create new PYQ record in database
  async createPYQRecord(pyqData) {
    const {
      title,
      year,
      fileUrl,
      fileName,
      fileSize,
      userId,
      subject,
      classLevel,
      board,
      language = 'en',
      semester,
      institution,
      department,
      courseCode
    } = pyqData;

    const pyqId = uuidv4();

    const query = `
      INSERT INTO "PreviousYearQuestion" (
        id, title, year, "fileUrl", "userId", subject, 
        "classLevel", board, language, semester, 
        institution, department, "courseCode", 
        "isVectorized", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, NOW(), NOW()
      ) RETURNING *`;

    const values = [
      pyqId, title, year, fileUrl, userId, subject,
      classLevel, board, language, semester,
      institution, department, courseCode, false
    ];

    try {
      const result = await db.query(query, values);
      console.log(`✅ PYQ record created: ${pyqId}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating PYQ record:', error);
      throw new Error('Failed to create PYQ record in database');
    }
  }

  // Update PYQ processing status
  async updatePYQStatus(pyqId, status, additionalData = {}) {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (status === 'vectorized') {
      updateFields.push(`"isVectorized" = $${paramIndex++}`);
      values.push(true);
    }

    if (additionalData.qdrantId) {
      updateFields.push(`"qdrantId" = $${paramIndex++}`);
      values.push(additionalData.qdrantId);
    }

    if (additionalData.qdrantCollection) {
      updateFields.push(`"qdrantCollection" = $${paramIndex++}`);
      values.push(additionalData.qdrantCollection);
    }

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(pyqId);

    const query = `
      UPDATE "PreviousYearQuestion" 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *`;

    try {
      const result = await db.query(query, values);
      console.log(`✅ PYQ status updated: ${pyqId}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating PYQ status:', error);
      throw error;
    }
  }

  // Get user's PYQ files
  async getUserPYQs(userId, limit = 20, offset = 0) {
    const query = `
      SELECT 
        id, title, year, "fileUrl", subject, "classLevel", 
        board, language, semester, institution, department, 
        "courseCode", "isVectorized", "createdAt", "updatedAt"
      FROM "PreviousYearQuestion" 
      WHERE "userId" = $1 
      ORDER BY "createdAt" DESC 
      LIMIT $2 OFFSET $3`;

    try {
      const result = await db.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching user PYQs:', error);
      throw error;
    }
  }

  // Get PYQ by ID
  async getPYQById(pyqId, userId) {
    const query = `
      SELECT * FROM "PreviousYearQuestion" 
      WHERE id = $1 AND "userId" = $2`;

    try {
      const result = await db.query(query, [pyqId, userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error fetching PYQ by ID:', error);
      throw error;
    }
  }

  //Adding delete PYQ method
  async deletePYQ(pyqId, userId) {
    const query = `
    DELETE FROM "PreviousYearQuestion" 
    WHERE id = $1 AND "userId" = $2 
    RETURNING *`;

    try {
      const result = await db.query(query, [pyqId, userId]);
      if (result.rows.length === 0) {
        throw new Error('PYQ not found or unauthorized');
      }
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error deleting PYQ:', error);
      throw error;
    }
  }
}

