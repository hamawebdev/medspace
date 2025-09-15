# Label Session Creation Feature Implementation

## Overview

This document describes the implementation of the "Create Label Session" feature that follows the workflow specified in `docs/test-label-session-endpoints.md`.

## Workflow Implementation

The feature implements the following 3-step workflow:

### 1. Session Creation
- **Endpoint**: `POST /api/v1/quiz-sessions/practice/{labelId}`
- **Purpose**: Creates a new practice session tied to the given label
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "sessionId": 123,
      "questionCount": 15,
      "title": "Practice: My Label Name"
    }
  }
  ```

### 2. Session Retrieval
- **Endpoint**: `GET /api/v1/quiz-sessions/{sessionId}`
- **Purpose**: Fetch the full session data (questions, answers, metadata)
- **Input**: `sessionId` extracted from step 1 response

### 3. Frontend Behavior
- **Redirect**: User is redirected to `/session/{sessionId}`
- **Rendering**: Session details are rendered using the GET response
- **Legacy**: No legacy label session endpoints are used

## Files Modified

### 1. API Service Layer (`src/lib/api-services.ts`)

Added new method `createLabelSession`:

```typescript
static async createLabelSession(labelId: number): Promise<ApiResponse<{
  sessionId: number;
  questionCount: number;
  title: string;
}>> {
  return apiClient.post<{
    sessionId: number;
    questionCount: number;
    title: string;
  }>(`/quiz-sessions/practice/${labelId}`);
}
```

### 2. Label Detail Page (`src/app/student/labels/[id]/page.tsx`)

Updated `handleStartPractice` function to implement the new workflow:

```typescript
const handleStartPractice = async () => {
  // Step 1: Create practice session by label
  const createResponse = await QuizService.createLabelSession(id);
  
  // Step 2: Fetch the full session data
  const sessionResponse = await QuizService.getQuizSession(sessionId);
  
  // Step 3: Redirect to session
  router.push(`/session/${sessionId}`);
}
```

### 3. Labels List Page (`src/app/student/labels/page.tsx`)

Updated `handleStartPractice` function with the same workflow implementation.

## Error Handling

The implementation includes comprehensive error handling as specified:

### POST Failure
- **Error Message**: "Unable to create label session"
- **User Action**: Can retry by clicking the button again

### GET Failure  
- **Error Message**: "Session not found. Please try again."
- **User Action**: Can retry by clicking the button again

### General Error Handling
- All errors are logged to console for debugging
- User-friendly error messages are displayed via toast notifications
- Loading states prevent duplicate requests
- Graceful fallback for any unexpected errors

## Testing

### Unit Tests
- Created `src/tests/label-session-creation.test.ts` for Jest-based unit testing
- Tests API method functionality and error handling

### API Integration Tests
- Created `src/tests/api-tests/label-session-creation.test.js` for end-to-end API testing
- Tests complete workflow including error scenarios
- Can be run with: `npm run test:labels:session`

## Usage

### From Label Detail Page
1. Navigate to `/student/labels/{labelId}`
2. Click "Start Practice Session" button
3. System creates session and redirects to `/session/{sessionId}`

### From Labels List Page
1. Navigate to `/student/labels`
2. Click "Start Practice Session" on any label card
3. System creates session and redirects to `/session/{sessionId}`

## Benefits

1. **Proper Session Management**: Each practice session gets a unique session ID
2. **No Legacy Dependencies**: Removes reliance on treating label ID as session ID
3. **Better Error Handling**: Clear error messages and retry capabilities
4. **Scalable Architecture**: Follows established patterns for session creation
5. **Consistent UX**: Same workflow across all label interfaces

## Migration Notes

- **Breaking Change**: Label IDs can no longer be used directly as session IDs
- **Backward Compatibility**: Existing sessions continue to work normally
- **Data Integrity**: New sessions are properly tracked in the database
- **Performance**: Minimal impact as workflow adds only one additional API call

## Future Enhancements

1. **Session Caching**: Cache session data to reduce API calls
2. **Offline Support**: Store session data locally for offline access
3. **Session Analytics**: Track session creation patterns and success rates
4. **Bulk Operations**: Allow creating multiple sessions from multiple labels
