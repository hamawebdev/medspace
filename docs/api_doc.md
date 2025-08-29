
# Course Analytics Endpoint

## Overview
The Course Analytics endpoint provides detailed course-level analytics for student quiz sessions. It allows students to view their performance broken down by courses within their quiz sessions.

## Endpoint Details

URL: GET /api/v1/students/course-analytics

Authentication: Required (JWT Bearer token)

Authorization: Student role required

Payment Check: Active subscription required

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| sessionId | number | No | - | Filter analytics for a specific session ID |
| sessionType | string | No | - | Filter by session type (PRACTICE, EXAM, MOCK) |
| page | number | No | 1 | Page number for pagination (1-1000) |
| limit | number | No | 20 | Items per page (1-50) |

## Response Format

{
  "success": true,
  "data": {
    "session": {
      "id": 432,
      "title": "Basic Anatomy Quiz",
      "type": "PRACTICE",
      "status": "COMPLETED",
      "completedAt": "2025-08-20T20:42:20.000Z",
      "totalQuestions": 10,
      "correctAnswers": 8,
      "incorrectAnswers": 2,
      "percentage": 80.0,
      "timeSpent": 45,
      "averageTimePerQuestion": 4.5,
      "courses": [
        {
          "id": 1,
          "name": "Human Anatomy",
          "description": "Study of human body structure",
          "moduleId": 5,
          "moduleName": "Basic Sciences",
          "courseAnalytics": {
            "totalQuestions": 30,
            "totalCorrectAnswers": 24,
            "totalIncorrectAnswers": 6,
            "overallAccuracy": 80.0
          }
        }
      ]
    },
    "pagination": {
      "currentPage": 1,
      "totalItems": 5,
      "totalPages": 1,
      "hasMore": false
    }
  }
}

## Example Requests

### Get analytics for a specific session
curl -X GET "http://localhost:3005/api/v1/students/course-analytics?sessionId=432" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

### Get analytics with pagination
curl -X GET "http://localhost:3005/api/v1/students/course-analytics?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

### Filter by session type
curl -X GET "http://localhost:3005/api/v1/students/course-analytics?sessionType=PRACTICE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

## Response Fields

### Session Object
- id: Unique session identifier
- title: Session title
- type: Session type (PRACTICE, EXAM, MOCK)
- status: Session status (NOT_STARTED, IN_PROGRESS, COMPLETED)
- completedAt: ISO timestamp when session was completed
- totalQuestions: Total number of questions in the session
- correctAnswers: Number of correctly answered questions
- incorrectAnswers: Number of incorrectly answered questions
- percentage: Overall session score percentage
- timeSpent: Total time spent on session (in minutes)
- averageTimePerQuestion: Average time per question (in minutes)
- courses: Array of course analytics

### Course Analytics Object
- id: Course identifier
- name: Course name
- description: Course description
- moduleId: Parent module identifier
- moduleName: Parent module name
- courseAnalytics: Performance metrics for this course
  - totalQuestions: Total questions from this course in the session
  - totalCorrectAnswers: Correct answers for this course
  - totalIncorrectAnswers: Incorrect answers for this course
  - overallAccuracy: Accuracy percentage for this course

### Pagination Object
- currentPage: Current page number
- totalItems: Total number of sessions matching criteria
- totalPages: Total number of pages
- hasMore: Boolean indicating if more pages exist

## Error Responses

### 401 Unauthorized
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Your session has expired or token is invalid. Please log in again.",
    "timestamp": "2025-08-26T10:38:57.317Z",
    "requestId": "8377sxknqx2"
  }
}


### 400 Bad Request (Invalid Parameters)
{
  "success": false,
  "message": "Query parameter validation failed: sessionId: Session ID must be positive (received: -1)",
  "errors": [
    {
      "field": "sessionId",
      "message": "Session ID must be positive",
      "code": "too_small",
      "received": -1
    }
  ]
}

### 404 Not Found (No Sessions)
{
  "success": false,
  "error": {
    "type": "Error",
    "message": "No sessions found matching the criteria",
    "timestamp": "2025-08-26T10:38:57.317Z",
    "requestId": "8377sxknqx2"
  }
}

## Implementation Notes

1. Authentication: The endpoint requires a valid JWT token with student role
2. Payment Check: Active subscription is required to access analytics
3. Pagination: Results are paginated with configurable page size
4. Course Grouping: Questions are automatically grouped by course
5. Time Calculation: Time spent is calculated from session start/completion timestamps
6. Accuracy Calculation: Course-level accuracy is calculated independently for each course

## Database Relationships

The endpoint leverages the following database relationships:
- QuizSession → QuizSessionQuestion → Question → Course → Module
- QuizSession → QuizAttempt → Question → Course

This allows for accurate course-level analytics based on the questions included in each session.


—
-
-

# Quiz Sessions API Documentation

## Endpoint Overview

Create Quiz Session
- URL: POST /api/v1/quizzes/quiz-sessions
- Authentication: Required (Bearer Token)
- Content-Type: application/json
- Access: Students with active subscriptions only

Creates a new quiz session with customizable filters and settings.

## Request Schema

interface CreateQuizSessionRequest {
  title: string;                    // Required: 3-100 characters
  type?: 'PRACTICE' | 'EXAM';      // Optional: defaults to 'PRACTICE'
  settings: {
    questionCount: number;          // Required: 1-100 questions
  };
  filters: QuizSessionFilters;      // Required: question filtering options
}

interface QuizSessionFilters {
  yearLevels?: YearLevel[];         // Optional: year level filtering
  courseIds?: number[];             // Optional: specific courses
  questionTypes?: QuestionType[];   // Optional: question type filtering
  examYears?: number[];             // Optional: exam year filtering
  questionSourceIds?: number[];     // Optional: question source filtering
  quizYears?: number[];             // Optional: quiz year filtering
}

## Filter Options

### Year Level Filtering
type YearLevel = 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN';

// Examples:
yearLevels: ['ONE']                 // First year only
yearLevels: ['ONE', 'TWO']          // First and second year
yearLevels: ['THREE', 'FOUR', 'FIVE'] // Clinical years

### Question Type Filtering
type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';

// Examples:
questionTypes: ['SINGLE_CHOICE']              // MCQ only
questionTypes: ['MULTIPLE_CHOICE']            // Multiple answer only
questionTypes: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'] // Both types

### Hierarchy Filtering
// Course/Module/Unite hierarchy (most specific to least specific)
courseIds: [1, 2, 3]      // Specific courses


### Source & Year Filtering
questionSourceIds: [1, 2, 3]    // Specific question sources
examYears: [2023, 2024]         // Questions from specific exam years
quizYears: [2023]               // Questions from specific quiz years

## Example Requests

### Basic Quiz Session
{
  "title": "Basic Anatomy Practice",
  "type": "PRACTICE",
  "settings": {
    "questionCount": 10
  },
  "filters": {
    "yearLevels": ["ONE"],
    "questionTypes": ["SINGLE_CHOICE"]
  }
}

### Filtered by Course
{
  "title": "Cardiology Exam Prep",
  "type": "EXAM",
  "settings": {
    "questionCount": 25
  },
  "filters": {
    "yearLevels": ["THREE", "FOUR"],
    "courseIds": [15, 16, 17],
    "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"]
  }
}

### Complex Multi-Filter Session
{
  "title": "Comprehensive Review",
  "type": "PRACTICE",
  "settings": {
    "questionCount": 50
  },
  "filters": {
    "yearLevels": ["TWO", "THREE"],
    "questionSourceIds": [1, 2, 4],
    "examYears": [2023, 2024],
    "questionTypes": ["SINGLE_CHOICE"]
  }
}

### Source-Specific Session
{
  "title": "Textbook Questions Only",
  "settings": {
    "questionCount": 15
  },
  "filters": {
    "yearLevels": ["ONE"],
    "questionSourceIds": [1],
    "quizYears": [2024]
  }
}

## Response Format

### Success Response (201 Created)
{
  "success": true,
  "data": {
    "sessionId": 123
  },
  "meta": {
    "timestamp": "2025-08-26T16:30:00.000Z",
    "requestId": "abc123"
  }
}

### Error Response (400 Bad Request)
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Question count must be between 1 and 100",
    "details": [
      {
        "field": "settings.questionCount",
        "message": "Question count must be between 1 and 100"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-08-26T16:30:00.000Z",
    "requestId": "abc123"
  }
}

## Access Control

### Subscription Requirements
- Active subscription required: Users must have an active, paid subscription
- Year level access: Users can only create sessions for year levels included in their subscription
- Study pack access: Questions are filtered based on user's accessible study packs


### User Permissions
- Students only: Endpoint restricted to users with STUDENT role
- Admin/Employee access: Blocked by design (use admin endpoints instead)

### Subscription Types
- Regular subscriptions: Access to specific year levels only
- Residency subscriptions: Access to all year levels and question sources
- Multi-year subscriptions: Access to multiple year levels based on active subscriptions

## Validation Rules

### Title Validation
- Required: Yes
- Length: 3-100 characters
- Format: Alphanumeric, spaces, hyphens, underscores, periods, exclamation marks, question marks
- Pattern: /^[a-zA-Z0-9\s\-_.,!?]+$/

### Question Count Validation
- Required: Yes
- Range: 1-100 questions
- Type: Integer

### Filter Validation
- Year levels: Must be valid enum values and accessible to user
- IDs: Must be positive integers
- Arrays: Cannot be empty if provided
- Exam/Quiz years: Must be between 1900 and current year + 10

## Error Scenarios

### 400 Bad Request
// Invalid title
{
  "error": {
    "type": "ValidationError",
    "message": "Title contains invalid characters"
  }
}

// Question count out of range
{
  "error": {
    "type": "ValidationError", 
    "message": "Question count must be between 1 and 100"
  }
}

### 403 Forbidden
// No active subscription
{
  "error": {
    "type": "SubscriptionRequiredError",
    "message": "Active subscription required to access this resource"
  }
}

// Year level not accessible
{
  "error": {
    "type": "ForbiddenError",
    "message": "You don't have access to the requested year levels"
  }
}

### 404 Not Found
// No questions found with filters
{
  "error": {
    "type": "NoQuestionsFoundError",
    "message": "No questions found matching the specified filters"
  }
}

// Insufficient questions
{
  "error": {
    "type": "InsufficientQuestionsError",
    "message": "Only 5 questions available, but 10 requested"
  }
}

### 500 Internal Server Error
// Database or system error
{
  "error": {
    "type": "QuizCreationFailedError",
    "message": "Failed to create quiz session. Please try again."
  }
}

## Implementation Tips

### Frontend Best Practices
1. Validate locally first: Check title length and question count before sending request
2. Handle loading states: Session creation may take a few seconds for complex filters
3. Cache filter options: Get available filters from /quiz-filters endpoint first
4. Graceful error handling: Show user-friendly messages for different error types
5. Subscription awareness: Disable unavailable year levels based on user's subscription

### Common Patterns
// Get user's available filters first
const filtersResponse = await fetch('/api/v1/quizzes/quiz-filters');
const availableFilters = await filtersResponse.json();

// Create session with validated filters
const sessionData = {
  title: userInput.title,
  type: 'PRACTICE',
  settings: { questionCount: userInput.count },
  filters: {
    yearLevels: userInput.selectedYears,
    questionTypes: ['SINGLE_CHOICE']
  }
};

const response = await fetch('/api/v1/quizzes/quiz-sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify(sessionData)
});


# Question Source API - Admin Documentation

## Overview
The Question Source API provides admin and employee users with comprehensive CRUD operations for managing question sources in the Medcin platform. Question sources represent the origin or reference material for questions (e.g., textbooks, exam papers, research materials).

## Base URL
/api/admin/question-sources

## Authentication & Authorization
- Required Role: Admin or Employee
- Middleware: adminOrEmployee
- Headers: 
  
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  

## Endpoints

### 1. Get All Question Sources
Retrieve a paginated list of all question sources with question counts.

Endpoint: GET /api/admin/question-sources

Query Parameters:
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10, max: 100 for admin)

Response:
{
  "success": true,
  "data": {
    "questionSources": [
      {
        "id": 1,
        "name": "Harrison's Principles of Internal Medicine",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "questionCount": 45
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}

### 2. Create Question Source
Create a new question source.

Endpoint: POST /api/admin/question-sources

Request Body:
{
  "name": "Medical Textbook Name"
}

Validation Rules:
- name: Required, 2-100 characters, alphanumeric with spaces, hyphens, and underscores only

Response (201 Created):
{
  "success": true,
  "data": {
    "message": "Question source created successfully",
    "questionSource": {
      "id": 26,
      "name": "Medical Textbook Name",
      "createdAt": "2024-01-20T14:25:00Z",
      "updatedAt": "2024-01-20T14:25:00Z"
    }
  }
}

Error Responses:
- 400 Bad Request: Name already exists or validation failed
- 500 Internal Server Error: Server error

### 3. Get Question Source by ID
Retrieve a specific question source with question count.

Endpoint: GET /api/admin/question-sources/:id

Path Parameters:
- id: Question source ID (integer)

Response:
{
  "success": true,
  "data": {
    "questionSource": {
      "id": 1,
      "name": "Harrison's Principles of Internal Medicine",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "_count": {
        "questions": 45
      }
    }
  }
}

Error Responses:
- 404 Not Found: Question source not found

### 4. Update Question Source
Update an existing question source.

Endpoint: PUT /api/admin/question-sources/:id

Path Parameters:
- id: Question source ID (integer)

Request Body:
{
  "name": "Updated Textbook Name"
}

Validation Rules:
- name: Optional, 2-100 characters, alphanumeric with spaces, hyphens, and underscores only

Response:
{
  "success": true,
  "data": {
    "message": "Question source updated successfully",
    "questionSource": {
      "id": 1,
      "name": "Updated Textbook Name",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  }
}

Error Responses:
- 400 Bad Request: Name already exists or validation failed
- 404 Not Found: Question source not found

### 5. Delete Question Source
Delete a question source (only if no associated questions exist).

Endpoint: DELETE /api/admin/question-sources/:id

Path Parameters:
- id: Question source ID (integer)

Response:
{
  "success": true,
  "data": {
    "message": "Question source deleted successfully"
  }
}

Error Responses:
- 400 Bad Request: Cannot delete - has associated questions
- 404 Not Found: Question source not found

## Data Models

### QuestionSource
interface QuestionSource {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  questions?: Question[]; // Related questions
  _count?: {
    questions: number;
  };
}

## Business Rules


1. Unique Names: Question source names must be unique across the system
2. Deletion Protection: Cannot delete question sources that have associated questions
3. Activity Logging: All CRUD operations are logged for audit trail
4. Name Validation: Names must be 2-100 characters, containing only letters, numbers, spaces, hyphens, and underscores

## Error Handling

### Common Error Codes
- 400: Bad Request (validation errors, constraint violations)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

### Example Error Response
{
  "success": false,
  "error": {
    "message": "Question source name already exists",
    "code": "BAD_REQUEST"
  }
}

## Usage Examples

### Creating a Question Source
curl -X POST /api/admin/question-sources \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Robbins Basic Pathology"}'

### Getting All Question Sources with Pagination
curl -X GET "/api/admin/question-sources?page=1&limit=20" \
  -H "Authorization: Bearer <token>"

### Updating a Question Source
curl -X PUT /api/admin/question-sources/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Source Name"}'

### Deleting a Question Source
curl -X DELETE /api/admin/question-sources/1 \
  -H "Authorization: Bearer <token>"

## Related APIs
- [Question Management API](./admin-question-api.md)
- [University Management API](./admin-university-api.md)
- [Course Management API](./admin-course-api.md)

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Employee activities are automatically logged for audit purposes
- Question sources are used to categorize and organize questions by their origin
- The API supports admin pagination limits (up to 100 items per page)