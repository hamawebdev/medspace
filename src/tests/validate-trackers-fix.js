/**
 * Test script to validate the trackers fetching fix
 * This tests the logic for handling both direct array and nested array responses
 */

console.log('🧪 Testing Trackers Fetching Logic Fix\n');

// Simulate the response handling logic from the trackers page
function handleTrackersResponse(response) {
  console.log('📋 Processing trackers response:', {
    success: response.success,
    hasData: !!response.data,
    dataType: typeof response.data,
    isArray: Array.isArray(response.data),
    hasNestedData: !!response.data?.data,
    nestedDataType: typeof response.data?.data,
    isNestedArray: Array.isArray(response.data?.data),
    fullResponse: response
  });

  if (response.success && response.data) {
    // Handle both possible response structures: response.data or response.data.data
    const actualData = Array.isArray(response.data) ? response.data : response.data.data;
    
    if (!Array.isArray(actualData)) {
      console.error('❌ Expected array but got:', {
        actualData,
        dataType: typeof actualData,
        responseStructure: response.data
      });
      return {
        success: false,
        error: 'Invalid response structure: expected array of trackers'
      };
    }

    console.log('✅ Successfully extracted trackers array:', actualData);
    return {
      success: true,
      trackers: actualData,
      count: actualData.length
    };
  } else {
    console.error('❌ Response not successful or no data:', response);
    return {
      success: false,
      error: response.error || 'Failed to fetch trackers'
    };
  }
}

// Test cases
const testCases = [
  {
    name: 'Direct array response (expected format)',
    response: {
      success: true,
      data: [
        { id: 1, title: 'Tracker 1' },
        { id: 2, title: 'Tracker 2' }
      ]
    },
    expectedResult: {
      success: true,
      count: 2
    }
  },
  {
    name: 'Nested array response (actual API format)',
    response: {
      success: true,
      data: {
        data: [
          { id: 3, title: 'Nested Tracker 1' },
          { id: 4, title: 'Nested Tracker 2' },
          { id: 5, title: 'Nested Tracker 3' }
        ]
      }
    },
    expectedResult: {
      success: true,
      count: 3
    }
  },
  {
    name: 'Empty direct array',
    response: {
      success: true,
      data: []
    },
    expectedResult: {
      success: true,
      count: 0
    }
  },
  {
    name: 'Empty nested array',
    response: {
      success: true,
      data: {
        data: []
      }
    },
    expectedResult: {
      success: true,
      count: 0
    }
  },
  {
    name: 'Non-array data (should fail)',
    response: {
      success: true,
      data: {
        message: 'No trackers found',
        count: 0
      }
    },
    expectedResult: {
      success: false
    }
  },
  {
    name: 'Failed response',
    response: {
      success: false,
      error: 'Unit not found'
    },
    expectedResult: {
      success: false
    }
  },
  {
    name: 'Nested non-array data (should fail)',
    response: {
      success: true,
      data: {
        data: {
          message: 'No trackers found'
        }
      }
    },
    expectedResult: {
      success: false
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
    const result = handleTrackersResponse(testCase.response);
    
    console.log('Output:', JSON.stringify(result, null, 2));
    
    // Validate results
    let testPassed = true;
    const expected = testCase.expectedResult;
    
    if (result.success !== expected.success) {
      console.log(`❌ FAIL: Expected success=${expected.success}, got ${result.success}`);
      testPassed = false;
    }
    
    if (expected.count !== undefined && result.count !== expected.count) {
      console.log(`❌ FAIL: Expected count=${expected.count}, got ${result.count}`);
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
  console.log('🎉 All tests passed! The trackers fetching fix should work correctly.');
} else {
  console.log('⚠️ Some tests failed. Please review the logic.');
}

console.log('\n🔍 Key Improvements Made:');
console.log('1. Added support for both direct array (response.data) and nested array (response.data.data) structures');
console.log('2. Added comprehensive logging to debug response structure issues');
console.log('3. Added proper error handling for non-array responses');
console.log('4. Maintained backward compatibility with the expected API format');
