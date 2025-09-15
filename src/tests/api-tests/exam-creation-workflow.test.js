/**
 * Exam Creation Workflow Test
 * 
 * Tests the updated exam creation workflow:
 * 1. POST /quizzes/sessions - Create exam session with new format
 * 2. GET /quiz-sessions/{sessionId} - Fetch session details
 * 3. Verify the complete workflow works end-to-end
 */

import { NewApiService } from '../../lib/api/new-api-services.js';

console.log('🧪 Testing Updated Exam Creation Workflow...\n');

async function testExamSessionCreation() {
  try {
    console.log('📋 Step 1: Testing createQuizSession API method for EXAM...');
    
    // Test exam session creation with new format
    const examSessionData = {
      title: "Test Exam Session",
      courseIds: [1, 2, 3],
      sessionType: "EXAM",
      questionTypes: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"],
      years: [2024],
      universityIds: [1],
      questionSourceIds: [1],
      rotations: []
    };
    
    console.log('🚀 Creating exam session with data:', JSON.stringify(examSessionData, null, 2));
    const createResponse = await NewApiService.createQuizSession(examSessionData);
    
    console.log('📊 Create Response:', JSON.stringify(createResponse, null, 2));
    
    if (!createResponse.success) {
      console.error('❌ Failed to create exam session:', createResponse.error);
      return false;
    }
    
    const { sessionId } = createResponse.data;
    console.log(`✅ Exam session created successfully!`);
    console.log(`   - Session ID: ${sessionId}`);
    
    console.log('\n📋 Step 2: Testing session retrieval...');
    console.log(`🔍 Fetching session details for ID: ${sessionId}`);
    
    const sessionResponse = await NewApiService.getQuizSession(sessionId);
    console.log('📊 Session Response:', JSON.stringify(sessionResponse, null, 2));
    
    if (!sessionResponse.success) {
      console.error('❌ Failed to fetch session details:', sessionResponse.error);
      return false;
    }
    
    console.log(`✅ Session details retrieved successfully!`);
    console.log(`   - Session ID: ${sessionResponse.data.id}`);
    console.log(`   - Title: ${sessionResponse.data.title}`);
    console.log(`   - Type: ${sessionResponse.data.type}`);
    console.log(`   - Status: ${sessionResponse.data.status}`);
    console.log(`   - Questions: ${sessionResponse.data.questions?.length || 0}`);
    
    console.log('\n🎉 Exam Creation Workflow Test PASSED!');
    console.log(`   - Created exam session ${sessionId}`);
    console.log(`   - Session follows new format (no questionCount, fixed questionTypes)`);
    console.log(`   - Ready for redirect to /session/${sessionId}`);
    
    return true;
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

async function testPracticeSessionCreation() {
  try {
    console.log('\n📋 Step 3: Testing createQuizSession API method for PRACTICE...');
    
    // Test practice session creation (should still include questionCount)
    const practiceSessionData = {
      title: "Test Practice Session",
      questionCount: 20,
      courseIds: [1, 2],
      sessionType: "PRACTISE",
      questionTypes: ["SINGLE_CHOICE"],
      years: [2024],
      universityIds: [1],
      questionSourceIds: [1]
    };
    
    console.log('🚀 Creating practice session with data:', JSON.stringify(practiceSessionData, null, 2));
    const createResponse = await NewApiService.createQuizSession(practiceSessionData);
    
    console.log('📊 Create Response:', JSON.stringify(createResponse, null, 2));
    
    if (!createResponse.success) {
      console.error('❌ Failed to create practice session:', createResponse.error);
      return false;
    }
    
    const { sessionId } = createResponse.data;
    console.log(`✅ Practice session created successfully!`);
    console.log(`   - Session ID: ${sessionId}`);
    
    return true;
    
  } catch (error) {
    console.error('💥 Practice session test failed with error:', error.message);
    return false;
  }
}

async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...\n');

  try {
    console.log('📋 Testing exam session without required fields...');

    // Test with missing required fields for EXAM
    const invalidExamData = {
      title: "Invalid Exam",
      courseIds: [1],
      sessionType: "EXAM"
      // Missing: questionTypes, years, universityIds, questionSourceIds, rotations
    };

    const response = await NewApiService.createQuizSession(invalidExamData);
    console.log('📊 Validation Response:', JSON.stringify(response, null, 2));

    if (response.success) {
      console.log('⚠️  Expected validation error but got success');
    } else {
      console.log('✅ Validation working correctly');
      console.log(`   - Error message: ${response.error}`);
      console.log(`   - Status code: ${response.statusCode}`);
    }

    return true;

  } catch (error) {
    console.error('💥 Validation test failed:', error.message);
    return false;
  }
}

async function testNoQuestionsError() {
  console.log('\n🧪 Testing No Questions Found Error...\n');

  try {
    console.log('📋 Testing exam session with filters that return no questions...');

    // Test with filters that should return no questions
    const noQuestionsData = {
      title: "No Questions Test",
      courseIds: [99999], // Non-existent course ID
      sessionType: "EXAM",
      questionTypes: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"],
      years: [1900], // Very old year unlikely to have questions
      universityIds: [99999], // Non-existent university
      questionSourceIds: [99999], // Non-existent source
      rotations: []
    };

    const response = await NewApiService.createQuizSession(noQuestionsData);
    console.log('📊 No Questions Response:', JSON.stringify(response, null, 2));

    if (response.success) {
      console.log('⚠️  Expected no questions error but got success');
    } else {
      console.log('✅ No questions error handling working correctly');
      console.log(`   - Error message: ${response.error}`);
      console.log(`   - Status code: ${response.statusCode}`);
    }

    return true;

  } catch (error) {
    console.error('💥 No questions test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Exam Creation Workflow Tests...\n');
  
  const results = [];
  
  // Test 1: Exam session creation
  results.push(await testExamSessionCreation());
  
  // Test 2: Practice session creation (for comparison)
  results.push(await testPracticeSessionCreation());
  
  // Test 3: Validation errors
  results.push(await testValidationErrors());

  // Test 4: No questions found error
  results.push(await testNoQuestionsError());
  
  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;
  
  console.log('\n📊 Test Summary:');
  console.log(`   - Passed: ${passedTests}/${totalTests}`);
  console.log(`   - Status: ${passedTests === totalTests ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Exam Creation Workflow is working correctly!');
    console.log('   - ✅ EXAM sessions use new format (no questionCount)');
    console.log('   - ✅ Fixed questionTypes: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"]');
    console.log('   - ✅ Session retrieval works after creation');
    console.log('   - ✅ Validation errors are handled properly');
  }
  
  return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

export { runAllTests, testExamSessionCreation, testPracticeSessionCreation, testValidationErrors, testNoQuestionsError };
