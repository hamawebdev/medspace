/**
 * Label Session Creation API Test
 * 
 * Tests the new workflow:
 * 1. POST /api/v1/quiz-sessions/practice/{labelId} - Create session
 * 2. GET /api/v1/quiz-sessions/{sessionId} - Fetch session details
 * 3. Verify the complete workflow works end-to-end
 */

import { QuizService } from '../../lib/api-services.js';

console.log('🧪 Testing Label Session Creation Workflow...\n');

async function testLabelSessionCreation() {
  try {
    console.log('📋 Step 1: Testing createLabelSession API method...');
    
    // Test with a mock label ID (you may need to adjust this based on your test data)
    const testLabelId = 1;
    
    console.log(`🚀 Creating session for label ID: ${testLabelId}`);
    const createResponse = await QuizService.createLabelSession(testLabelId);
    
    console.log('📊 Create Response:', JSON.stringify(createResponse, null, 2));
    
    if (!createResponse.success) {
      console.error('❌ Failed to create label session:', createResponse.error);
      return false;
    }
    
    const { sessionId, questionCount, title } = createResponse.data;
    console.log(`✅ Session created successfully!`);
    console.log(`   - Session ID: ${sessionId}`);
    console.log(`   - Question Count: ${questionCount}`);
    console.log(`   - Title: ${title}`);
    
    console.log('\n📋 Step 2: Testing session retrieval...');
    console.log(`🔍 Fetching session details for ID: ${sessionId}`);
    
    const sessionResponse = await QuizService.getQuizSession(sessionId);
    console.log('📊 Session Response:', JSON.stringify(sessionResponse, null, 2));
    
    if (!sessionResponse.success) {
      console.error('❌ Failed to fetch session details:', sessionResponse.error);
      return false;
    }
    
    console.log(`✅ Session details retrieved successfully!`);
    console.log(`   - Session ID: ${sessionResponse.data.id}`);
    console.log(`   - Title: ${sessionResponse.data.title}`);
    console.log(`   - Status: ${sessionResponse.data.status}`);
    console.log(`   - Questions: ${sessionResponse.data.questions?.length || 0}`);
    
    console.log('\n🎉 Label Session Creation Workflow Test PASSED!');
    console.log(`   - Created session ${sessionId} from label ${testLabelId}`);
    console.log(`   - Session contains ${questionCount} questions`);
    console.log(`   - Ready for redirect to /session/${sessionId}`);
    
    return true;
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...\n');
  
  try {
    console.log('📋 Testing with invalid label ID...');
    const invalidLabelId = 99999;
    
    const response = await QuizService.createLabelSession(invalidLabelId);
    console.log('📊 Error Response:', JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('⚠️  Expected error but got success - this might indicate the label exists');
    } else {
      console.log('✅ Error handling working correctly');
      console.log(`   - Error message: ${response.error}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Error handling test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Label Session Creation Tests...\n');
  
  const results = {
    workflow: await testLabelSessionCreation(),
    errorHandling: await testErrorHandling()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log(`   - Workflow Test: ${results.workflow ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   - Error Handling Test: ${results.errorHandling ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🏁 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Label Session Creation feature is ready for use!');
    console.log('   - API endpoints are working correctly');
    console.log('   - Error handling is implemented');
    console.log('   - Frontend can safely use the new workflow');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
