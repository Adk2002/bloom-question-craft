// workers/pyqWorker.js
import { Worker } from 'bullmq';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from '@qdrant/js-client-rest';
import fs from 'fs/promises';

import path from 'path';

// Configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const qdrantConfig = {
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY || undefined,
};

// Initialize Gemini AI with new syntax
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: qdrantConfig.url,
  apiKey: qdrantConfig.apiKey,
});

// Collection name for PYQ embeddings
const COLLECTION_NAME = 'pyq_embeddings';

/**
 * Load PDF parsing library dynamically to avoid initialization issues
 */
async function loadPdfParser() {
  try {
    // Import the package correctly
    const pdfParse = (await import('pdf-parse')).default;
    return pdfParse;
  } catch (error) {
    console.error('⚠️ Error loading pdf-parse:', error);
    console.warn('⚠️ PDF parsing failed, trying alternative method...');
    // Fallback to basic text extraction
    return null;
  }
}

/**
 * Generate embeddings using Gemini AI
 */
async function generateEmbeddings(texts) {
  try {
    console.log(`🧠 Generating embeddings for ${texts.length} chunks...`);
    const embeddings = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (text) => {
        try {
          const response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: text
          });
          
          if (!response.embeddings || response.embeddings.length === 0) {
            throw new Error('No embedding values returned');
          }
          
          return response.embeddings;
        } catch (embeddingError) {
          console.error(`❌ Error generating embedding for chunk ${i}:`, embeddingError.message);
          // Return zero vector as fallback
          return new Array(768).fill(0);
        }
      });
      
      const batchEmbeddings = await Promise.all(batchPromises);
      embeddings.push(...batchEmbeddings);
      
      // Delay to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`📊 Progress: ${Math.min(i + batchSize, texts.length)}/${texts.length} embeddings generated`);
    }
    
    console.log(`✅ Generated ${embeddings.length} embeddings`);
    return embeddings;
  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Initialize Qdrant collection if it doesn't exist
 */
async function initializeQdrantCollection() {
  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      collection => collection.name === COLLECTION_NAME
    );

    if (!collectionExists) {
      console.log(`🔧 Creating Qdrant collection: ${COLLECTION_NAME}`);
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 768, // Gemini embedding dimension
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });
      console.log(`✅ Collection ${COLLECTION_NAME} created successfully`);
    } else {
      console.log(`📁 Collection ${COLLECTION_NAME} already exists`);
    }
  } catch (error) {
    console.error('❌ Error initializing Qdrant collection:', error);
    throw error;
  }
}

/**
 * Load and parse PDF document with better error handling
 */
async function loadPDF(filePath) {
  try {
    console.log(`📖 Loading PDF: ${filePath}`);
    
    // Check if file exists
    await fs.access(filePath);
    console.log(`✅ File exists: ${filePath}`);
    
    // Read PDF file
    const pdfBuffer = await fs.readFile(filePath);
    console.log(`📄 File read successfully, size: ${pdfBuffer.length} bytes`);
    
    // Load PDF parser
    const pdfParse = await loadPdfParser();
    if (!pdfParse) {
      throw new Error('PDF parser initialization failed');
    }
    
    // Parse PDF with error handling
    console.log('🔍 Parsing PDF content...');
    let pdfData;
    try {
      pdfData = await pdfParse(pdfBuffer);
    } catch (parseError) {
      throw new Error(`PDF parsing failed: ${parseError.message}`);
    }
    
    if (!pdfData || !pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    
    // Create document structure
    const documents = [{
      pageContent: pdfData.text,
      metadata: {
        source: filePath,
        totalPages: pdfData.numpages || 1,
        fileName: path.basename(filePath),
        fileSize: pdfBuffer.length,
        parseDate: new Date().toISOString()
      }
    }];
    
    console.log(`✅ PDF loaded successfully. Pages: ${pdfData.numpages || 1}, Text length: ${pdfData.text.length}`);
    return documents;
  } catch (error) {
    console.error('❌ Error loading PDF:', error.message);
    throw new Error(`Failed to load PDF: ${error.message}`);
  }
}

/**
 * Split documents into chunks using LangChain
 */
async function chunkDocuments(documents) {
  try {
    console.log('✂️ Splitting documents into chunks...');
    
    // Configure text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,        // Size of each chunk
      chunkOverlap: 200,      // Overlap between chunks
      separators: ['\n\n', '\n', '.', '!', '?', ';', ':', ' ', ''], // Split hierarchy
    });
    
    // Split documents
    const chunks = await textSplitter.splitDocuments(documents);
    
    console.log(`✅ Documents split into ${chunks.length} chunks`);
    return chunks;
  } catch (error) {
    console.error('❌ Error chunking documents:', error);
    throw new Error(`Failed to chunk documents: ${error.message}`);
  }
}

/**
 * Generate embeddings and store in Qdrant manually
 */
async function storeEmbeddings(chunks, metadata) {
  try {
    console.log('🧠 Generating embeddings and storing in Qdrant...');
    
    // Extract text content from chunks
    const texts = chunks.map(chunk => chunk.pageContent);
    
    // Generate embeddings using Gemini
    const embeddings = await generateEmbeddings(texts);
    
    // Prepare points for Qdrant
    const points = chunks.map((chunk, index) => ({
      id: Date.now() + index, // Simple ID generation
      vector: embeddings[index],
      payload: {
        text: chunk.pageContent,
        metadata: {
          ...chunk.metadata,
          ...metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          timestamp: new Date().toISOString(),
        }
      }
    }));
    
    // Store in Qdrant in batches
    const batchSize = 50;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points: batch
      });
      console.log(`📤 Stored batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(points.length/batchSize)}`);
    }
    
    console.log(`✅ Successfully stored ${chunks.length} embeddings in Qdrant`);
    return { pointsCount: points.length };
  } catch (error) {
    console.error('❌ Error storing embeddings:', error);
    throw new Error(`Failed to store embeddings: ${error.message}`);
  }
}

/**
 * Process PYQ PDF job
 */
async function processPYQJob(job) {
  const { fileName, filePath, subject, year, examType, uploadedBy } = job.data;
  
  try {
    console.log(`🚀 Starting PYQ processing for: ${fileName}`);
    
    // Update job progress
    await job.updateProgress(10);
    
    // Step 1: Initialize Qdrant collection
    await initializeQdrantCollection();
    await job.updateProgress(20);
    
    // Step 2: Load PDF
    const documents = await loadPDF(filePath);
    await job.updateProgress(40);
    
    // Step 3: Chunk documents
    const chunks = await chunkDocuments(documents);
    await job.updateProgress(60);
    
    // Step 4: Prepare metadata
    const metadata = {
      fileName,
      subject,
      year,
      examType,
      uploadedBy,
      totalPages: documents.length,
      processingDate: new Date().toISOString(),
    };
    
    // Step 5: Generate embeddings and store in Qdrant
    await storeEmbeddings(chunks, metadata);
    await job.updateProgress(90);
    
    // Step 6: Clean up (optional - remove original file)
    // await fs.unlink(filePath);
    
    await job.updateProgress(100);
    
    const result = {
      success: true,
      fileName,
      totalChunks: chunks.length,
      totalPages: documents.length,
      processingTime: Date.now() - job.processedOn,
      message: 'PYQ processed and stored successfully',
    };
    
    console.log(`✅ PYQ processing completed: ${fileName}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Error processing PYQ ${fileName}:`, error);
    throw error;
  }
}

/**
 * Create and start the PYQ worker
 */
export function createPYQWorker() {
  console.log('🔧 Creating PYQ worker...');
  
  const worker = new Worker('pyq-processing', processPYQJob, {
    connection: redisConfig,
    concurrency: 1, // Reduced to 1 for stability
    limiter: {
      max: 3,         // Maximum 3 jobs
      duration: 60000, // Per minute
    },
  });

  // Worker event listeners
  worker.on('ready', () => {
    console.log('🟢 PYQ Worker is ready and waiting for jobs');
  });

  worker.on('active', (job) => {
    console.log(`🔄 Processing job ${job.id}: ${job.data.fileName}`);
  });

  worker.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result.message);
  });

  worker.on('failed', (job, err) => {
    console.log(`❌ Job ${job?.id} failed:`, err.message);
    console.log(job, `Im inside redis`);
  });

  worker.on('progress', (job, progress) => {
    console.log(`📊 Job ${job.id} progress: ${progress}%`);
  });

  worker.on('error', (err) => {
    console.error('🔥 Worker error:', err);
  });

  return worker;
}

/**
 * Graceful shutdown
 */
export async function shutdownWorker(worker) {
  console.log('🛑 Shutting down PYQ worker...');
  await worker.close();
  console.log('✅ PYQ worker shut down gracefully');
}

// Export for external use
export { processPYQJob };