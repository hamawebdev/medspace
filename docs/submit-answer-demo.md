# Submit-Answer API Integration Demo

## How to Test the Integration

### 1. Complete a Quiz Session
1. Navigate to `/session/{sessionId}` for any active quiz session
2. Answer questions and complete the quiz
3. The system will automatically call the submit-answer API
4. You'll be redirected to `/session/{sessionId}/results`

### 2. Expected API Call
When you complete a quiz, the system makes this API call:

```http
POST /api/v1/students/quiz-sessions/{sessionId}/submit-answer
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "selectedAnswerId": 4
    },
    {
      "questionId": 2,
      "selectedAnswerIds": [7, 9]
    }
  ],
  "timeSpent": 1800
}
```

### 3. Expected API Response
The API should return:

```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "scoreOutOf20": 16.5,
    "percentageScore": 82.5,
    "timeSpent": 1800,
    "answeredQuestions": 15,
    "totalQuestions": 20,
    "status": "completed"
  }
}
```

### 4. Results Page Display
On the results page, you should see:

#### Main Score Section
- **Percentage Score**: 82.5% (large display)
- **Correct/Total**: 15/20 Correct (badge)
- **Performance Level**: Based on percentage

#### Performance Details Section
- **Correct**: Number of correct answers
- **Incorrect**: Number of incorrect answers  
- **Time Spent**: 30:00 (formatted as mm:ss)

#### Submit-Answer Response Fields Section
- **Score Out of 20**: 16.5/20
- **Answered Questions**: 15/20
- **Percentage Score**: 82.5%
- **Status**: completed (if available)

### 5. Console Logging
Check the browser console for debug information:

```
📊 Submit-answer response data detected: {
  sessionId: 123,
  scoreOutOf20: 16.5,
  percentageScore: 82.5,
  timeSpent: 1800,
  answeredQuestions: 15,
  totalQuestions: 20,
  status: "completed"
}
```

### 6. Error Handling Test Cases

#### Missing Fields
If some fields are missing from the API response:
- **scoreOutOf20**: Shows "N/A/20"
- **answeredQuestions**: Falls back to calculated value
- **timeSpent**: Shows "0:00" if missing

#### Invalid Response
If the API returns `success: false`:
- Error toast notification appears
- User is redirected appropriately
- Console shows error details

### 7. Backward Compatibility
The integration maintains compatibility with existing sessions:
- Sessions without submit-answer response data still work
- Calculated values are used as fallbacks
- No breaking changes to existing functionality

### 8. Testing Different Session Types

#### Practice Sessions
- Navigate to `/session/{practiceSessionId}/results`
- All submit-answer fields should display correctly
- Time formatting should be consistent

#### Exam Sessions  
- Navigate to `/student/quiz/results/{examSessionId}`
- Same field handling as practice sessions
- Consistent UI/UX experience

### 9. Manual Testing Checklist

- [ ] Complete a quiz session end-to-end
- [ ] Verify all submit-answer response fields are displayed
- [ ] Check time is formatted as mm:ss
- [ ] Confirm percentage and score out of 20 match
- [ ] Verify answered questions count is accurate
- [ ] Test with missing optional fields
- [ ] Check console for proper logging
- [ ] Verify error handling with invalid responses
- [ ] Test both practice and exam session types
- [ ] Confirm backward compatibility with old sessions

### 10. Troubleshooting

#### Fields Not Displaying
1. Check browser console for API response
2. Verify submit-answer endpoint is being called
3. Check if response has `success: true`
4. Ensure all required fields are present

#### Time Not Formatted Correctly
1. Verify `timeSpent` field in API response
2. Check `formatTimeMMSS()` function implementation
3. Ensure time is in seconds (not milliseconds)

#### Scores Don't Match
1. Compare `scoreOutOf20` and `percentageScore` fields
2. Verify calculation logic in API
3. Check for rounding differences

### 11. API Response Validation

Use this JavaScript snippet in browser console to validate the response:

```javascript
// Check if submit-answer response is properly structured
const validateSubmitAnswerResponse = (response) => {
  const required = ['sessionId', 'percentageScore', 'totalQuestions', 'status'];
  const optional = ['scoreOutOf20', 'timeSpent', 'answeredQuestions'];
  
  console.log('Required fields:', required.every(field => response.hasOwnProperty(field)));
  console.log('Optional fields present:', optional.filter(field => response.hasOwnProperty(field)));
  console.log('Response structure:', response);
};

// Use after completing a quiz session
```

This integration ensures that all submit-answer API response fields are properly handled and displayed across both practice and exam session result pages.
