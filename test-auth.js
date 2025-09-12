#!/usr/bin/env node

/**
 * Test script for the authentication system
 * This script tests the auth-login-script.js and demonstrates token usage
 */

import { authenticate } from './auth-login-script.js';
import axios from 'axios';
import fs from 'fs/promises';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Test authenticated API call
 */
async function testAuthenticatedCall(token, baseUrl) {
  try {
    log('🧪 Testing authenticated API call...', colors.blue);
    
    const axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Medcin-Auth-Test/1.0'
      }
    });
    
    // Test with a simple endpoint that requires authentication
    // Using the content filters endpoint from the Postman collection
    const response = await axiosInstance.get('/students/content/filters');
    
    if (response.status === 200 && response.data.success) {
      log('✅ Authenticated API call successful!', colors.green);
      log(`📊 Response data preview: ${JSON.stringify(response.data).substring(0, 100)}...`, colors.cyan);
      return true;
    } else {
      log('❌ Authenticated API call failed - invalid response', colors.red);
      return false;
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      log('❌ Authentication failed - token may be invalid', colors.red);
    } else if (error.response?.status === 403) {
      log('❌ Access forbidden - insufficient permissions', colors.red);
    } else {
      log(`❌ API call failed: ${error.message}`, colors.red);
    }
    return false;
  }
}

/**
 * Load saved token from file
 */
async function loadSavedToken() {
  try {
    const tokenData = await fs.readFile('./auth-token.json', 'utf8');
    const parsed = JSON.parse(tokenData);
    return parsed.token;
  } catch (error) {
    log('⚠️  No saved token found', colors.yellow);
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  try {
    log('🧪 Starting Authentication Tests...', colors.bright);
    log('=' .repeat(50), colors.cyan);
    
    // Test 1: Authentication
    log('\n📋 Test 1: Authentication Process', colors.blue);
    const authResult = await authenticate();
    
    if (!authResult.success) {
      throw new Error('Authentication failed');
    }
    
    // Test 2: Token validation
    log('\n📋 Test 2: Token Validation', colors.blue);
    const token = authResult.token;
    
    if (!token || token.length < 10) {
      throw new Error('Invalid token received');
    }
    
    log(`✅ Token validation passed (${token.length} characters)`, colors.green);
    
    // Test 3: Authenticated API call
    log('\n📋 Test 3: Authenticated API Call', colors.blue);
    
    // Extract base URL from environment
    const envData = await fs.readFile('./.env.local', 'utf8');
    const baseUrlMatch = envData.match(/NEXT_PUBLIC_API_BASE_URL=(.+)/);
    
    if (!baseUrlMatch) {
      throw new Error('Could not extract base URL from .env.local');
    }
    
    const baseUrl = baseUrlMatch[1].trim();
    const apiCallSuccess = await testAuthenticatedCall(token, baseUrl);
    
    if (!apiCallSuccess) {
      throw new Error('Authenticated API call failed');
    }
    
    // Test 4: Token persistence
    log('\n📋 Test 4: Token Persistence', colors.blue);
    const savedToken = await loadSavedToken();
    
    if (savedToken !== token) {
      throw new Error('Token not properly saved to file');
    }
    
    log('✅ Token persistence test passed', colors.green);
    
    // Success summary
    log('\n' + '=' .repeat(50), colors.cyan);
    log('🎉 All tests passed successfully!', colors.bright + colors.green);
    log('\n📋 Test Results:', colors.cyan);
    log('  ✅ Authentication Process', colors.green);
    log('  ✅ Token Validation', colors.green);
    log('  ✅ Authenticated API Call', colors.green);
    log('  ✅ Token Persistence', colors.green);
    
    log('\n🎫 Token Information:', colors.cyan);
    log(`  📄 Token Length: ${token.length} characters`, colors.cyan);
    log(`  📁 Saved to: ./auth-token.json`, colors.cyan);
    log(`  🌍 Environment Variable: JWT_TOKEN`, colors.cyan);
    
    log('\n💡 Usage Example:', colors.yellow);
    log('  const token = process.env.JWT_TOKEN;', colors.yellow);
    log('  const headers = { Authorization: `Bearer ${token}` };', colors.yellow);
    
  } catch (error) {
    log('\n' + '=' .repeat(50), colors.cyan);
    log('💥 Tests failed!', colors.bright + colors.red);
    log(`❌ Error: ${error.message}`, colors.red);
    
    log('\n🔧 Next Steps:', colors.yellow);
    log('1. Check if the API server is running', colors.yellow);
    log('2. Verify ngrok tunnel is active', colors.yellow);
    log('3. Ensure credentials are correct', colors.yellow);
    log('4. Check network connectivity', colors.yellow);
    
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests, testAuthenticatedCall, loadSavedToken };
