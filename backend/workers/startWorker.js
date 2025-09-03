// workers/startWorker.js
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import { createPYQWorker, shutdownWorker } from './pyqWorker.js';


// Load environment variables
dotenv.config();

let worker;

/**
 * Start the PYQ processing worker
 */
async function startWorker() {
  try {
    console.log('🚀 Starting PYQ Processing Worker...');
    
    // Enhanced API key validation
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing in environment variables');
    }
    
    // Update API key pattern to match Google's format (starts with 'AIza')
    const apiKeyPattern = /^AIza[a-zA-Z0-9_-]{30,}$/;
    if (!apiKeyPattern.test(process.env.GEMINI_API_KEY)) {
      throw new Error('Invalid GEMINI_API_KEY format. Key should start with "AIza" followed by alphanumeric characters');
    }

    // Add more detailed validation logging
    console.log('📋 Configuration:');
    console.log('   - Redis Host:', process.env.REDIS_HOST || 'localhost');
    console.log('   - Redis Port:', process.env.REDIS_PORT || 6379);
    console.log('   - Qdrant URL:', process.env.QDRANT_URL || 'http://localhost:6333');
    console.log('   - Gemini API Key:', `${process.env.GEMINI_API_KEY.substring(0, 7)}...`);

    // Test API key with correct model name and better error handling
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
      });
      
      console.log('🔍 Testing Gemini API connection...');
      
      // Test with a simple embedding request
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: 'test connection'
      });
      
      if (!response.embeddings || response.embeddings.length === 0) {
        throw new Error('Failed to generate test embedding - no embedding values returned');
      }
      
      console.log('✅ Gemini API key and embedding model validated successfully');
      console.log(`   - Test embedding dimensions: ${response.embeddings.length}`);
      
    } catch (apiError) {
      console.error('❌ Detailed API Error:', {
        message: apiError.message,
        status: apiError.status,
        statusText: apiError.statusText,
        stack: apiError.stack
      });
      
      // Provide specific error guidance
      if (apiError.message.includes('API key not valid')) {
        throw new Error(`Invalid Gemini API key. Please check:
1. Your API key is correct and starts with 'AIza'
2. The API key has the necessary permissions
3. Your Google Cloud project has the Generative AI API enabled
4. You haven't exceeded your API quotas`);
      } else if (apiError.message.includes('model not found') || apiError.message.includes('404')) {
        throw new Error(`Model not found. Check if 'gemini-embedding-001' is available in your region`);
      } else {
        throw new Error(`Gemini API validation failed: ${apiError.message}`);
      }
    }
    
    // Create and start the worker
    worker = createPYQWorker();
    
    console.log('✅ PYQ Worker started successfully');
    console.log('🔍 Waiting for jobs in queue: pyq-processing');
    
    // Handle graceful shutdown
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('uncaughtException', (error) => {
      console.error('🔥 Uncaught Exception:', error);
      gracefulShutdown();
    });
    
  } catch (error) {
    console.error('❌ Failed to start worker:', error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown() {
  console.log('\n🛑 Received shutdown signal...');
  
  if (worker) {
    await shutdownWorker(worker);
  }
  
  console.log('👋 PYQ Worker stopped');
  process.exit(0);
}

// Start the worker
startWorker();