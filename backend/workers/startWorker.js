// workers/startWorker.js
import dotenv from 'dotenv';
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
    console.log('📋 Configuration:');
    console.log('   - Redis Host:', process.env.REDIS_HOST || 'localhost');
    console.log('   - Redis Port:', process.env.REDIS_PORT || 6379);
    console.log('   - Qdrant URL:', process.env.QDRANT_URL || 'http://localhost:6333');
    console.log('   - Gemini API Key:', process.env.GEMINI_API_KEY ? '✓ Configured' : '❌ Missing');
    
    // Validate required environment variables
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required in environment variables');
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