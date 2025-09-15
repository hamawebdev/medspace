# Session Status Management

This document describes the implementation of session status management for quiz sessions, which automatically updates session status based on user actions and quiz completion state.

## Overview

The session status management feature implements the following requirements:

1. **Status Handling**: Automatically sets status to `IN_PROGRESS` when user exits before answering all questions, and `COMPLETED` when user finishes answering all questions.

2. **Trigger Points**: Updates status on exit actions (exit button, close, pause with unanswered questions) and on last answer submission.

3. **Error Handling**: Implements retry logic and graceful error handling for status update failures.

4. **Validation**: Ensures only valid enum values (`IN_PROGRESS`, `COMPLETED`) are sent and validates input data.

5. **Consistency**: Applies same behavior for both practice and exam sessions.

## Architecture

### Core Components

#### SessionStatusManager (`src/lib/session-status-manager.ts`)
Central utility class that manages all session status updates with the following key methods:

- `setInProgress()`: Updates status to IN_PROGRESS
- `setCompleted()`: Updates status to COMPLETED  
- `updateBasedOnCompletion()`: Automatically determines and sets appropriate status
- `handleBeforeUnload()`: Handles browser close/navigation events
- `validateSessionData()`: Validates input parameters
- `determineStatus()`: Logic for determining correct status

#### API Service Updates (`src/lib/api-services.ts`)
Enhanced QuizService with:

- `updateQuizSessionStatusWithRetry()`: Retry logic with exponential backoff
- Validation of enum values
- Comprehensive error handling and logging

### Integration Points

#### Quiz Layout (`src/components/student/quiz/quiz-layout.tsx`)
- Browser `beforeunload` event handler
- Tab visibility change detection
- Automatic status updates on navigation

#### Enhanced Exit Dialog (`src/components/student/quiz/enhanced-exit-dialog.tsx`)
- Status updates when exiting to dashboard
- Status updates when viewing results
- Proper status determination based on completion state

#### Quiz API Context (`src/components/student/quiz/quiz-api-context.tsx`)
- Status updates on pause with unanswered questions
- Status updates on quiz completion
- Enhanced retry submission with status management

## Status Determination Logic

The system determines the appropriate status based on the following rules:

```typescript
function determineStatus(totalQuestions: number, answeredQuestions: number, isExiting: boolean): SessionStatus {
  // If all questions are answered, always mark as completed
  if (answeredQuestions === totalQuestions && totalQuestions > 0) {
    return 'COMPLETED';
  }
  
  // If exiting with unanswered questions, mark as in progress
  if (isExiting && answeredQuestions > 0) {
    return 'IN_PROGRESS';
  }

  // Default to in progress for any active session
  return 'IN_PROGRESS';
}
```

## Trigger Points

### 1. Exit Actions → IN_PROGRESS
- Exit button click with unanswered questions
- Browser close/navigation with unanswered questions  
- Pause with unanswered questions
- Tab visibility change with unanswered questions

### 2. Quiz Completion → COMPLETED
- Submit all answers when all questions are answered
- Finish button on last question
- Automatic completion when reaching 100% progress

## Error Handling

### Retry Logic
- Automatic retry with exponential backoff (1s, 2s, 4s, max 5s)
- Configurable retry count (default: 1 retry)
- Graceful degradation on persistent failures

### Validation
- Input parameter validation (sessionId, totalQuestions, answeredQuestions)
- Status enum validation
- Comprehensive error logging

### Fallback Strategies
- Local storage preservation on API failures
- Toast notifications for user feedback
- Silent mode for background operations

## Browser Compatibility

### sendBeacon Support
For reliable status updates during page unload:
- Uses `navigator.sendBeacon()` when available
- Fallback to regular API calls for older browsers
- Proper blob formatting for beacon requests

### Event Handling
- `beforeunload` event for browser close
- `visibilitychange` event for tab switching
- Keyboard shortcuts (ESC key) for exit dialog

## Usage Examples

### Basic Status Updates
```typescript
// Set status to IN_PROGRESS
await SessionStatusManager.setInProgress(sessionId, {
  showToast: true,
  retryCount: 1
});

// Set status to COMPLETED
await SessionStatusManager.setCompleted(sessionId, {
  showToast: true,
  retryCount: 1
});
```

### Automatic Status Determination
```typescript
// Automatically determine and set appropriate status
await SessionStatusManager.updateBasedOnCompletion(
  sessionId,
  totalQuestions,
  answeredQuestions,
  isExiting,
  { showToast: false }
);
```

### Browser Unload Handling
```typescript
// Handle browser close/navigation
useEffect(() => {
  const handleBeforeUnload = () => {
    SessionStatusManager.handleBeforeUnload(
      sessionId,
      totalQuestions,
      answeredQuestions
    );
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [sessionId, totalQuestions, answeredQuestions]);
```

## Testing

Comprehensive test suite covers:
- Status determination logic
- Input validation
- Error handling scenarios
- Browser compatibility
- Edge cases and boundary conditions

Run tests with:
```bash
npm test src/lib/__tests__/session-status-manager.test.ts
```

## Monitoring and Debugging

### Logging
- Structured console logging with context
- Success/failure tracking
- Performance metrics

### Analytics Integration
- Google Analytics event tracking
- Custom monitoring service support
- Error reporting integration

### Debug Utilities
```typescript
// Get pending updates count
SessionStatusManager.getPendingUpdatesCount();

// Clear pending updates
SessionStatusManager.clearPendingUpdates();

// Validate session data
SessionStatusManager.validateSessionData(sessionId, totalQuestions, answeredQuestions);
```

## Configuration

### Default Options
```typescript
interface SessionStatusUpdateOptions {
  showToast?: boolean;     // Default: false for IN_PROGRESS, true for COMPLETED
  retryCount?: number;     // Default: 1
  silent?: boolean;        // Default: false
}
```

### Environment Variables
- `NODE_ENV`: Affects logging verbosity
- Production mode enables analytics tracking

## Best Practices

1. **Always validate input data** before status updates
2. **Use silent mode** for background operations
3. **Handle errors gracefully** with appropriate user feedback
4. **Avoid duplicate concurrent updates** for the same session
5. **Test browser compatibility** for critical paths
6. **Monitor status update success rates** in production

## Troubleshooting

### Common Issues
1. **Status not updating**: Check network connectivity and API endpoint
2. **Validation errors**: Verify sessionId, totalQuestions, and answeredQuestions values
3. **Browser compatibility**: Ensure sendBeacon fallback is working
4. **Race conditions**: Use the built-in deduplication logic

### Debug Steps
1. Check console logs for detailed error messages
2. Verify API endpoint is responding correctly
3. Test with different browser/network conditions
4. Use debug utilities to inspect internal state
