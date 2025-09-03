// comprehensive-debug.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

async function comprehensiveDebug() {
  console.log('=== COMPREHENSIVE API DEBUG ===\n');
  
  // 1. Environment Variable Check
  console.log('1. ENVIRONMENT VARIABLES:');
  console.log('   - .env file exists:', fs.existsSync('.env'));
  console.log('   - GEMINI_API_KEY defined:', !!process.env.GEMINI_API_KEY);
  console.log('   - API Key length:', process.env.GEMINI_API_KEY?.length || 'undefined');
  console.log('   - Starts with AIza:', process.env.GEMINI_API_KEY?.startsWith('AIza') || false);
  console.log('   - API Key preview:', process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 8)}...` : 'NOT FOUND');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('\n❌ CRITICAL: GEMINI_API_KEY not found in environment!');
    console.log('Check your .env file and make sure it contains:');
    console.log('GEMINI_API_KEY=AIza...');
    return;
  }
  
  // 2. API Key Format Validation
  console.log('\n2. API KEY FORMAT VALIDATION:');
  const apiKey = process.env.GEMINI_API_KEY;
  const isValidFormat = /^AIza[a-zA-Z0-9_-]{35}$/.test(apiKey);
  console.log('   - Valid format:', isValidFormat);
  
  if (!isValidFormat) {
    console.log('   ❌ API key format appears invalid');
    console.log('   Expected format: AIza followed by 35 alphanumeric characters');
  }
  
  // 3. Test API Connection
  console.log('\n3. API CONNECTION TESTS:');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Test 1: Simple text generation (most basic test)
  try {
    console.log('   Testing basic text generation...');
    const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await textModel.generateContent('Hello');
    console.log('   ✅ Text generation works:', result.response.text().substring(0, 50) + '...');
  } catch (error) {
    console.log('   ❌ Text generation failed:', error.message);
    
    if (error.message.includes('API key not valid')) {
      console.log('   This confirms the API key issue');
      console.log('\n   TROUBLESHOOTING STEPS:');
      console.log('   1. Go to https://aistudio.google.com/app/apikey');
      console.log('   2. Create a NEW API key (delete old one)');
      console.log('   3. Copy the ENTIRE key starting with AIza');
      console.log('   4. Update your .env file');
      console.log('   5. Restart your application completely');
      return;
    }
  }
  
  // Test 2: Embedding generation with different models
  const embeddingModels = [
    'text-embedding-004',
    'embedding-001',
    'models/embedding-001',
    'models/text-embedding-004'
  ];
  
  console.log('\n   Testing embedding models...');
  let workingEmbeddingModel = null;
  
  for (const modelName of embeddingModels) {
    try {
      console.log(`   Trying: ${modelName}...`);
      const embeddingModel = genAI.getGenerativeModel({ model: modelName });
      const result = await embeddingModel.embedContent('test embedding');
      
      if (result.embedding && result.embedding.values) {
        console.log(`   ✅ ${modelName} WORKS! Dimensions: ${result.embedding.values.length}`);
        workingEmbeddingModel = modelName;
        break;
      }
    } catch (error) {
      console.log(`   ❌ ${modelName} failed: ${error.message}`);
    }
  }
  
  if (workingEmbeddingModel) {
    console.log(`\n✅ SUCCESS! Use this model in your code: "${workingEmbeddingModel}"`);
    
    // Generate sample code
    console.log('\n4. WORKING CODE EXAMPLE:');
    console.log(`
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: '${workingEmbeddingModel}' });
const result = await model.embedContent(textToEmbed);
const embedding = result.embedding.values;
`);
  } else {
    console.log('\n❌ NO EMBEDDING MODELS WORK');
    console.log('This indicates a fundamental API key or permissions issue');
  }
  
  // 4. Check for multiple .env files
  console.log('\n4. ENVIRONMENT FILE CHECK:');
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   - ${file} exists`);
      try {
        const content = fs.readFileSync(file, 'utf8');
        const hasGeminiKey = content.includes('GEMINI_API_KEY');
        console.log(`     Contains GEMINI_API_KEY: ${hasGeminiKey}`);
      } catch (err) {
        console.log(`     Error reading ${file}`);
      }
    }
  });
}

comprehensiveDebug().catch(console.error);