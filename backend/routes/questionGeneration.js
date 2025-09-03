// routes/questionGeneration.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { authMiddleware } from '../auth/middleware/authMiddleware.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Dotenv from 'dotenv';
Dotenv.config();

const router = express.Router();

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
});

const COLLECTION_NAME = 'pyq_embeddings';

/**
 * Generate embeddings for user query
 */
async function generateQueryEmbedding(query) {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(query);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}
 
/**
 * Search relevant context from Qdrant
 */
async function searchRelevantContext(query, userId, limit = 10) {
  try {
    console.log(`🔍 Searching for relevant context: "${query}"`);
    
    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Search in Qdrant
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: limit,
      with_payload: true,
      filter: {
        must: [
          {
            key: 'metadata.uploadedBy',
            match: { value: userId }
          }
        ]
      }
    });
    
    // Extract relevant contexts
    const contexts = searchResult.map(result => ({
      text: result.payload.text,
      score: result.score,
      metadata: result.payload.metadata
    }));
    
    console.log(`✅ Found ${contexts.length} relevant contexts`);
    return contexts;
  } catch (error) {
    console.error('Error searching context:', error);
    throw error;
  }
}

/**
 * Generate questions using Gemini with context
 */
async function generateQuestionsWithGemini(prompt, contexts, preferences) {
  try {
    console.log('🧠 Generating questions with Gemini...');
    
    // Prepare context from retrieved documents
    const contextText = contexts
      .map((ctx, index) => `Context ${index + 1} (Score: ${ctx.score.toFixed(3)}):\n${ctx.text}`)
      .join('\n\n');
    
    // Create comprehensive prompt for Gemini
    const fullPrompt = `
You are an expert question paper generator specializing in Bloom's Taxonomy. Generate questions based on the provided context from previous year papers.

**CONTEXT FROM PREVIOUS YEAR PAPERS:**
${contextText}

**USER PREFERENCES:**
- Subject: ${preferences.subject || 'General'}
- Total Marks: ${preferences.totalMarks || 'Not specified'}
- Question Pattern: ${preferences.questionPattern || 'Mixed'}
- Marks Distribution: ${preferences.marksDistribution || 'Not specified'}

**USER REQUEST:**
${prompt}

**BLOOM'S TAXONOMY LEVELS TO INCLUDE:**
1. **Knowledge/Remembering** (10-20% of total marks) - Recall facts, terms, concepts
2. **Comprehension/Understanding** (15-25% of total marks) - Explain ideas, summarize
3. **Application** (20-30% of total marks) - Use knowledge in new situations
4. **Analysis** (15-20% of total marks) - Break down information, find patterns
5. **Synthesis/Create** (10-15% of total marks) - Combine ideas to create something new
6. **Evaluation** (10-15% of total marks) - Judge value, make decisions

**OUTPUT FORMAT REQUIREMENTS:**
Please provide the output in a well-structured format with:

1. **QUESTION PAPER HEADER**
   - Subject and Topic
   - Total Marks and Time Duration
   - Instructions for students

2. **QUESTIONS ORGANIZED BY BLOOM'S LEVELS**
   For each level, provide:
   - Level name and cognitive description
   - Questions with marks allocation
   - Clear numbering

3. **MARKS DISTRIBUTION TABLE**
   Show distribution across Bloom's levels

4. **ANSWER GUIDELINES** (brief hints for each question)

Generate questions that are:
- Directly relevant to the provided context
- Appropriate for the specified subject and level
- Following the requested question pattern
- Properly distributed across Bloom's taxonomy levels
- Include variety in question types (MCQ, short answer, essay, etc.)

Make the questions challenging yet fair, and ensure they test different cognitive abilities according to Bloom's taxonomy.
`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 4000,
      },
    });

    const result = await model.generateContent(fullPrompt);
    const generatedText = result.response.text();
    
    console.log('✅ Questions generated successfully');
    
    return {
      questions: generatedText,
      contextsUsed: contexts.length,
      sources: contexts.map(ctx => ({
        fileName: ctx.metadata.fileName,
        subject: ctx.metadata.subject,
        year: ctx.metadata.year,
        score: ctx.score.toFixed(3)
      }))
    };
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw error;
  }
}

/**
 * Generate PDF from question paper
 */
async function generateQuestionPaperPDF(questionData, preferences) {
  try {
    console.log('📄 Generating PDF...');
    
    const doc = new PDFDocument();
    const fileName = `question_paper_${Date.now()}.pdf`;
    const filePath = path.join('./generated', fileName);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync('./generated')) {
      fs.mkdirSync('./generated');
    }
    
    doc.pipe(fs.createWriteStream(filePath));
    
    // PDF Header
    doc.fontSize(20).font('Helvetica-Bold');
    doc.text('QUESTION PAPER', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).font('Helvetica');
    doc.text(`Subject: ${preferences.subject || 'General'}`, { align: 'center' });
    doc.text(`Total Marks: ${preferences.totalMarks || 'Not specified'}`, { align: 'center' });
    doc.text(`Pattern: ${preferences.questionPattern || 'Mixed'}`, { align: 'center' });
    doc.moveDown();
    
    // Add generated content
    doc.fontSize(12).font('Helvetica');
    const lines = questionData.questions.split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        // Check if line is a header (starts with # or **)
        if (line.startsWith('**') || line.startsWith('#')) {
          doc.fontSize(14).font('Helvetica-Bold');
          doc.text(line.replace(/\*\*/g, '').replace(/#/g, ''), { continued: false });
          doc.moveDown(0.5);
        } else {
          doc.fontSize(11).font('Helvetica');
          doc.text(line, { continued: false });
        }
      } else {
        doc.moveDown(0.3);
      }
    }
    
    // Footer
    doc.fontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, {
      align: 'center',
      y: doc.page.height - 50
    });
    
    doc.end();
    
    return { fileName, filePath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * POST /api/questions/generate
 * Generate questions based on user prompt and uploaded PDFs
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.email; // or req.user.id
    const { 
      prompt, 
      subject, 
      totalMarks, 
      questionPattern, 
      marksDistribution 
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question prompt is required'
      });
    }

    // User preferences
    const preferences = {
      subject,
      totalMarks,
      questionPattern,
      marksDistribution
    };

    // Search for relevant context from user's uploaded PDFs
    const contexts = await searchRelevantContext(prompt, userId, 15);
    
    if (contexts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No relevant content found. Please upload some previous year papers first.'
      });
    }

    // Generate questions using Gemini with context
    const questionData = await generateQuestionsWithGemini(prompt, contexts, preferences);

    res.json({
      success: true,
      data: {
        questions: questionData.questions,
        contextsUsed: questionData.contextsUsed,
        sources: questionData.sources,
        preferences: preferences,
        timestamp: new Date().toISOString()
      },
      message: 'Questions generated successfully'
    });

  } catch (error) {
    console.error('Error in question generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions',
      error: error.message
    });
  }
});

/**
 * POST /api/questions/generate-pdf
 * Generate and download PDF of question paper
 */
router.post('/generate-pdf', authMiddleware, async (req, res) => {
  try {
    const { questionContent, preferences } = req.body;

    if (!questionContent) {
      return res.status(400).json({
        success: false,
        message: 'Question content is required'
      });
    }

    const pdfResult = await generateQuestionPaperPDF(
      { questions: questionContent }, 
      preferences || {}
    );

    // Send file
    res.download(pdfResult.filePath, `question_paper_${Date.now()}.pdf`, (err) => {
      if (err) {
        console.error('Error sending PDF:', err);
      }
      // Clean up file after sending
      setTimeout(() => {
        try {
          fs.unlinkSync(pdfResult.filePath);
        } catch (cleanupError) {
          console.error('Error cleaning up PDF:', cleanupError);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

/**
 * GET /api/questions/user-contexts
 * Get list of user's uploaded contexts for reference
 */
router.get('/user-contexts', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.email;
    
    // Get some sample contexts to show user what's available
    const contexts = await searchRelevantContext('general questions', userId, 5);
    
    const contextSummary = contexts.map(ctx => ({
      fileName: ctx.metadata.fileName,
      subject: ctx.metadata.subject,
      year: ctx.metadata.year,
      previewText: ctx.text.substring(0, 100) + '...'
    }));

    res.json({
      success: true,
      data: {
        totalContexts: contexts.length,
        availableContexts: contextSummary
      }
    });

  } catch (error) {
    console.error('Error fetching user contexts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contexts'
    });
  }
});

export default router;