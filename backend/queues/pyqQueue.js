// queues/pyqQueue.js
import { Queue } from 'bullmq';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// Create PYQ processing queue
export const pyqProcessingQueue = new Queue('pyq-processing', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 20, // Keep last 20 completed jobs
    removeOnFail: 100,    // Keep last 100 failed jobs for debugging
  },
});

// Function to add job to queue
export const addPYQProcessingJob = async (jobData) => {
  try {
    const job = await pyqProcessingQueue.add('process-pyq-pdf', jobData, {
      priority: 1, // Higher priority for PYQ processing
      delay: 0,    // Process immediately
    });
    
    console.log(`📤 PYQ processing job queued: ${jobData.fileName} (Job ID: ${job.id})`);
    return job.id;
  } catch (error) {
    console.error('❌ Error adding PYQ job to queue:', error);
    throw error;
  }
};