#!/usr/bin/env node

/**
 * Medcin Platform Authentication Script
 * 
 * This script:
 * 1. Reads login endpoint details from the Postman collection
 * 2. Uses production API URL from .env.local
 * 3. Sends login request with proper credentials
 * 4. Extracts and stores JWT token
 * 5. Handles errors gracefully
 * 6. Manages production API headers
 */

import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  postmanCollectionPath: path.join(__dirname, 'docs', 'Medcin_Platform_Comprehensive_API_Workflows_Copy_postman_collection.json'),
  envLocalPath: path.join(__dirname, '.env.local'),
  tokenOutputPath: path.join(__dirname, 'auth-token.json'),
  timeout: 15000, // 15 seconds
  retryAttempts: 3,
  retryDelay: 2000 // 2 seconds
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Enhanced logging with colors and timestamps
 */
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Read and parse the Postman collection to extract login endpoint details
 */
async function readPostmanCollection() {
  try {
    log('📖 Reading Postman collection...', colors.blue);
    
    const collectionData = await fs.readFile(CONFIG.postmanCollectionPath, 'utf8');
    const collection = JSON.parse(collectionData);
    
    // Find the authentication section
    const authSection = collection.item.find(item => 
      item.name === '🔐 Authentication' || 
      item.name.toLowerCase().includes('authentication')
    );
    
    if (!authSection) {
      throw new Error('Authentication section not found in Postman collection');
    }
    
    // Find the login request
    const loginRequest = authSection.item.find(item => 
      item.name === 'Login and Get JWT Token' ||
      item.name.toLowerCase().includes('login')
    );
    
    if (!loginRequest) {
      throw new Error('Login request not found in authentication section');
    }
    
    // Extract endpoint details
    const request = loginRequest.request;
    const method = request.method;
    const pathSegments = request.url.path;

    // Remove 'api/v1' from path since it's already in base URL
    const filteredSegments = pathSegments.filter(segment =>
      segment !== 'api' && segment !== 'v1'
    );
    const endpoint = '/' + filteredSegments.join('/');
    
    // Parse request body
    let credentials = {};
    if (request.body && request.body.raw) {
      try {
        credentials = JSON.parse(request.body.raw);
      } catch (e) {
        log('⚠️  Could not parse credentials from Postman collection, using defaults', colors.yellow);
        credentials = { email: 'test@example.com', password: 'password123' };
      }
    }
    
    log(`✅ Found login endpoint: ${method} ${endpoint}`, colors.green);
    log(`📧 Using credentials: ${credentials.email}`, colors.cyan);
    
    return {
      method,
      endpoint,
      credentials,
      headers: request.header || []
    };
    
  } catch (error) {
    log(`❌ Error reading Postman collection: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Read API base URL from .env.local file
 */
async function readApiBaseUrl() {
  try {
    log('🔗 Reading API base URL from .env.local...', colors.blue);

    const envData = await fs.readFile(CONFIG.envLocalPath, 'utf8');
    const lines = envData.split('\n');

    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_API_BASE_URL=')) {
        const baseUrl = line.split('=')[1].trim();
        log(`✅ Found base URL: ${baseUrl}`, colors.green);
        return baseUrl;
      }
    }

    throw new Error('NEXT_PUBLIC_API_BASE_URL not found in .env.local');

  } catch (error) {
    log(`❌ Error reading .env.local: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Create axios instance with proper headers for production API
 */
function createAxiosInstance(baseUrl) {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'MedSpace-Auth-Script/1.0'
    }
  });
  
  // Request interceptor for logging
  instance.interceptors.request.use(
    (config) => {
      log(`🚀 Making ${config.method.toUpperCase()} request to: ${config.url}`, colors.cyan);
      return config;
    },
    (error) => {
      log(`❌ Request error: ${error.message}`, colors.red);
      return Promise.reject(error);
    }
  );
  
  // Response interceptor for logging
  instance.interceptors.response.use(
    (response) => {
      log(`✅ Response received: ${response.status} ${response.statusText}`, colors.green);
      return response;
    },
    (error) => {
      if (error.response) {
        log(`❌ Response error: ${error.response.status} ${error.response.statusText}`, colors.red);
        if (error.response.data) {
          log(`📄 Error details: ${JSON.stringify(error.response.data, null, 2)}`, colors.yellow);
        }
      } else if (error.request) {
        log(`❌ Network error: No response received`, colors.red);
      } else {
        log(`❌ Request setup error: ${error.message}`, colors.red);
      }
      return Promise.reject(error);
    }
  );
  
  return instance;
}

/**
 * Attempt login with retry logic
 */
async function attemptLogin(axiosInstance, endpoint, credentials, attempt = 1) {
  try {
    log(`🔐 Attempting login (attempt ${attempt}/${CONFIG.retryAttempts})...`, colors.blue);
    
    const response = await axiosInstance.post(endpoint, credentials);
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response: missing data field');
    }
    
    if (!response.data.success) {
      throw new Error(`Login failed: ${response.data.error?.message || 'Unknown error'}`);
    }
    
    // Extract token from response
    const tokenPath = response.data.data?.tokens?.accessToken;
    if (!tokenPath) {
      throw new Error('JWT token not found in response');
    }
    
    log(`✅ Login successful!`, colors.green);
    log(`🎫 JWT token extracted (${tokenPath.length} characters)`, colors.cyan);
    
    return {
      success: true,
      token: tokenPath,
      response: response.data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    if (attempt < CONFIG.retryAttempts) {
      log(`⚠️  Attempt ${attempt} failed: ${error.message}`, colors.yellow);
      log(`⏳ Retrying in ${CONFIG.retryDelay/1000} seconds...`, colors.yellow);
      await sleep(CONFIG.retryDelay);
      return attemptLogin(axiosInstance, endpoint, credentials, attempt + 1);
    } else {
      throw error;
    }
  }
}

/**
 * Save authentication token to file
 */
async function saveToken(tokenData) {
  try {
    log('💾 Saving token to file...', colors.blue);
    
    const tokenInfo = {
      ...tokenData,
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(), // Assume 24h expiry
      usage: {
        note: 'Use this token in Authorization header as: Bearer <token>',
        example: `Authorization: Bearer ${tokenData.token.substring(0, 20)}...`
      }
    };
    
    await fs.writeFile(CONFIG.tokenOutputPath, JSON.stringify(tokenInfo, null, 2));
    log(`✅ Token saved to: ${CONFIG.tokenOutputPath}`, colors.green);
    
    // Also set as environment variable for current session
    process.env.JWT_TOKEN = tokenData.token;
    log(`🌍 Token set as JWT_TOKEN environment variable`, colors.cyan);
    
  } catch (error) {
    log(`❌ Error saving token: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Main authentication function
 */
async function authenticate() {
  const startTime = Date.now();
  
  try {
    log('🚀 Starting Medcin Platform Authentication...', colors.bright);
    log('=' .repeat(60), colors.cyan);
    
    // Step 1: Read Postman collection
    const loginConfig = await readPostmanCollection();
    
    // Step 2: Read API base URL
    const baseUrl = await readApiBaseUrl();
    
    // Step 3: Create axios instance
    const axiosInstance = createAxiosInstance(baseUrl);
    
    // Step 4: Attempt login
    const authResult = await attemptLogin(
      axiosInstance, 
      loginConfig.endpoint, 
      loginConfig.credentials
    );
    
    // Step 5: Save token
    await saveToken(authResult);
    
    // Success summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('=' .repeat(60), colors.cyan);
    log(`🎉 Authentication completed successfully in ${duration}s`, colors.bright + colors.green);
    log(`🎫 Token: ${authResult.token.substring(0, 50)}...`, colors.cyan);
    log(`📁 Token file: ${CONFIG.tokenOutputPath}`, colors.cyan);
    
    return authResult;
    
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('=' .repeat(60), colors.cyan);
    log(`💥 Authentication failed after ${duration}s`, colors.bright + colors.red);
    log(`❌ Error: ${error.message}`, colors.red);
    
    // Provide troubleshooting tips
    log('\n🔧 Troubleshooting tips:', colors.yellow);
    log('1. Check if production API is accessible', colors.yellow);
    log('2. Verify API server is running on the backend', colors.yellow);
    log('3. Ensure credentials in Postman collection are correct', colors.yellow);
    log('4. Check network connectivity and firewall settings', colors.yellow);
    
    process.exit(1);
  }
}

// Export for use as module
export { authenticate, readPostmanCollection, readApiBaseUrl };

// Run if called directly
const isMainModule = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (isMainModule) {
  authenticate().catch(error => {
    console.error('Authentication failed:', error.message);
    process.exit(1);
  });
}
