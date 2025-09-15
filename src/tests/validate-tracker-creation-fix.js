/**
 * Manual validation script for tracker creation fix
 * This script tests the logic we implemented to fix the redirection issue
 */

console.log('🧪 Testing Tracker Creation Logic Fix\n');

// Simulate the response handling logic from our components
function handleTrackerCreationResponse(response) {
  console.log('📋 Processing response:', {
    success: response.success,
    hasData: !!response.data,
    dataId: response.data?.id,
    dataType: typeof response.data?.id,
    fullResponse: response
  });

  if (response.success) {
    // Check for ID in both possible locations: response.data.id or response.data.data.id
    const actualData = response.data?.data || response.data;
    const trackerId = actualData?.id;

    if (trackerId !== undefined && trackerId !== null) {
      console.log('✅ Success: Redirecting to tracker:', trackerId);
      return {
        success: true,
        trackerId,
        shouldRedirect: true,
        redirectUrl: `/student/suivi-cours/tracker/${trackerId}`,
        message: 'Suivi de cours créé avec succès'
      };
    } else {
      console.error('❌ Warning: Tracker created but no ID returned:', {
        response,
        dataExists: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        nestedDataExists: !!response.data?.data,
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : 'no nested data',
        actualData,
        actualDataKeys: actualData ? Object.keys(actualData) : 'no actual data'
      });
      return {
        success: true,
        trackerId: null,
        shouldRedirect: false,
        redirectUrl: '/student/suivi-cours',
        error: 'Suivi créé mais impossible de rediriger. Veuillez vérifier la liste des suivis.'
      };
    }
  } else {
    console.error('❌ Error: Create card failed:', response);
    return {
      success: false,
      error: response.error || 'Failed to create tracker'
    };
  }
}

// Test cases
const testCases = [
  {
    name: 'Successful response with valid ID',
    response: {
      success: true,
      data: {
        id: 123,
        title: 'Test Tracker',
        description: 'Test Description',
        studentId: 1,
        createdAt: '2025-09-12T10:00:00.000Z',
        updatedAt: '2025-09-12T10:00:00.000Z'
      }
    },
    expectedResult: {
      success: true,
      shouldRedirect: true,
      trackerId: 123
    }
  },
  {
    name: 'Successful response without ID',
    response: {
      success: true,
      data: {
        title: 'Test Tracker',
        description: 'Test Description'
        // No ID field
      }
    },
    expectedResult: {
      success: true,
      shouldRedirect: false,
      trackerId: null
    }
  },
  {
    name: 'Successful response with ID as 0 (falsy)',
    response: {
      success: true,
      data: {
        id: 0,
        title: 'Test Tracker'
      }
    },
    expectedResult: {
      success: true,
      shouldRedirect: true, // 0 is valid ID now with improved logic
      trackerId: 0
    }
  },
  {
    name: 'Successful response with null data',
    response: {
      success: true,
      data: null
    },
    expectedResult: {
      success: true,
      shouldRedirect: false,
      trackerId: null
    }
  },
  {
    name: 'Failed response',
    response: {
      success: false,
      error: 'Validation failed: Title is required'
    },
    expectedResult: {
      success: false
    }
  },
  {
    name: 'Successful response with string ID',
    response: {
      success: true,
      data: {
        id: '456',
        title: 'Test Tracker'
      }
    },
    expectedResult: {
      success: true,
      shouldRedirect: true,
      trackerId: '456'
    }
  },
  {
    name: 'Successful response with nested data structure',
    response: {
      success: true,
      data: {
        data: {
          id: 789,
          title: 'Nested Test Tracker',
          description: 'Test with nested structure'
        }
      }
    },
    expectedResult: {
      success: true,
      shouldRedirect: true,
      trackerId: 789
    }
  },
  {
    name: 'Successful response with nested data but no ID',
    response: {
      success: true,
      data: {
        data: {
          title: 'Nested Test Tracker',
          description: 'Test with nested structure but no ID'
        }
      }
    },
    expectedResult: {
      success: true,
      shouldRedirect: false,
      trackerId: null
    }
  }
];

// Run tests
let passedTests = 0;
let totalTests = testCases.length;

console.log(`Running ${totalTests} test cases...\n`);

testCases.forEach((testCase, index) => {
  console.log(`\n🧪 Test ${index + 1}: ${testCase.name}`);
  console.log('Input:', JSON.stringify(testCase.response, null, 2));
  
  try {
    const result = handleTrackerCreationResponse(testCase.response);
    
    console.log('Output:', JSON.stringify(result, null, 2));
    
    // Validate results
    let testPassed = true;
    const expected = testCase.expectedResult;
    
    if (result.success !== expected.success) {
      console.log(`❌ FAIL: Expected success=${expected.success}, got ${result.success}`);
      testPassed = false;
    }
    
    if (expected.shouldRedirect !== undefined && result.shouldRedirect !== expected.shouldRedirect) {
      console.log(`❌ FAIL: Expected shouldRedirect=${expected.shouldRedirect}, got ${result.shouldRedirect}`);
      testPassed = false;
    }
    
    if (expected.trackerId !== undefined && result.trackerId !== expected.trackerId) {
      console.log(`❌ FAIL: Expected trackerId=${expected.trackerId}, got ${result.trackerId}`);
      testPassed = false;
    }
    
    if (testPassed) {
      console.log('✅ PASS');
      passedTests++;
    }
    
  } catch (error) {
    console.log('❌ FAIL: Exception thrown:', error.message);
  }
});

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! The tracker creation fix should work correctly.');
} else {
  console.log('⚠️ Some tests failed. Please review the logic.');
}

console.log('\n🔍 Key Improvements Made:');
console.log('1. Fixed the condition logic to properly handle response.success');
console.log('2. Added detailed logging for debugging');
console.log('3. Improved error handling to distinguish between API failures and missing IDs');
console.log('4. Maintained backward compatibility with existing error messages');
