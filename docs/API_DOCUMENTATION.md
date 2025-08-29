# Medcin Platform API Documentation

## Authentication
All endpoints require JWT Bearer token authentication.
```
Authorization: Bearer <jwt_token>
```

---

## Modified Endpoints

### 1. Notes API (Grouped by Module)

#### Get Student Notes - Grouped by Module
**GET** `/api/v1/students/notes`

Returns student notes grouped by their associated module through the question→course→module relationship.

**Query Parameters:**
- `questionId` (optional): Filter notes by specific question ID
- `quizId` (optional): Filter notes by specific quiz ID

**Response:**
```json
{
  "success": true,
  "data": {
    "groupedByModule": [
      {
        "module": {
          "id": 1,
          "name": "Anatomy",
          "description": "Human anatomy module"
        },
        "notes": [
          {
            "id": 1,
            "noteText": "Important concept about...",
            "questionId": 123,
            "quizId": null,
            "question": {
              "id": 123,
              "questionText": "What is the function of...",
              "course": {
                "id": 1,
                "name": "Basic Anatomy"
              }
            },
            "quiz": null,
            "createdAt": "2025-08-25T10:00:00.000Z",
            "updatedAt": "2025-08-25T10:00:00.000Z"
          }
        ]
      }
    ],
    "totalNotes": 1,
    "totalModules": 1
  }
}
```

#### Create Student Note
**POST** `/api/v1/students/notes`

**Request Body:**
```json
{
  "noteText": "This is my note content",
  "questionId": 123,  // optional
  "quizId": 456       // optional
}
```

#### Get Notes for Specific Question
**GET** `/api/v1/students/questions/{questionId}/notes`

---

### 2. Labels API (Question-based)

#### Get Student Labels - Question-focused
**GET** `/api/v1/students/labels`

Returns labels with associated questions instead of sessions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Important Questions",
      "statistics": {
        "quizzesCount": 0,
        "questionsCount": 2,
        "quizSessionsCount": 0,
        "totalItems": 2
      },
      "questionIds": [123, 456],
      "questions": [
        {
          "id": 123,
          "questionText": "What is the function of...",
          "course": {
            "id": 1,
            "name": "Basic Anatomy",
            "module": {
              "id": 1,
              "name": "Anatomy",
              "description": "Human anatomy module"
            }
          },
          "createdAt": "2025-08-25T10:00:00.000Z"
        }
      ],
      "createdAt": "2025-08-25T09:00:00.000Z"
    }
  ]
}
```

#### Create Student Label
**POST** `/api/v1/students/labels`

**Request Body:**
```json
{
  "name": "Important Questions"
}
```

**⚠️ Note**: Label names must be unique per user. If you try to create a label with a name that already exists for the user, you'll get a unique constraint error. Use descriptive, unique names like "Exam Prep 2025-08-25" or "Study Session A".

#### Add Question to Label
**POST** `/api/v1/students/questions/{questionId}/labels/{labelId}`

#### Remove Question from Label
**DELETE** `/api/v1/students/questions/{questionId}/labels/{labelId}`

#### Get Label by ID
**GET** `/api/v1/students/labels/{labelId}`

---

### 3. Todos API (Excluding Completed)

#### Get Todos - Exclude Completed by Default
**GET** `/api/v1/students/todos`

**Query Parameters:**
- `includeCompleted` (boolean): Include completed todos (default: false)
- `status` (string): Filter by status (PENDING, IN_PROGRESS, COMPLETED)
- `type` (string): Filter by type (READING, QUIZ, SESSION, EXAM, OTHER)
- `priority` (string): Filter by priority (LOW, MEDIUM, HIGH)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": 306,
        "title": "Study for exam",
        "description": "Review chapter 1-5",
        "type": "READING",
        "priority": "HIGH",
        "status": "PENDING",
        "dueDate": null,
        "completedAt": null,
        "course": null,
        "quiz": null,
        "exam": null,
        "quizSession": null,
        "isOverdue": false,
        "createdAt": "2025-08-25T18:55:29.114Z",
        "updatedAt": "2025-08-25T18:55:29.114Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalItems": 1,
      "hasMore": false
    }
  }
}
```

#### Create Todo
**POST** `/api/v1/students/todos`

**Request Body:**
```json
{
  "title": "Study for exam",
  "description": "Review chapter 1-5",
  "type": "READING",
  "priority": "HIGH",
  "dueDate": "2025-08-30T10:00:00.000Z",  // optional
  "courseId": 1,  // optional
  "quizId": 2     // optional
}
```

#### Complete Todo
**PUT** `/api/v1/students/todos/{todoId}/complete`

---

## Course Progress API

### Get Progress Overview
**GET** `/api/v1/students/progress/overview`

Returns comprehensive progress overview including courses, quiz scores, and exam results.

**Response:**
```json
{
  "success": true,
  "data": {
    "completedCourses": [
      {
        "courseId": 1,
        "courseName": "Basic Anatomy",
        "moduleId": 1,
        "moduleName": "Anatomy",
        "uniteId": 1,
        "uniteName": "Medical Sciences",
        "layer1Completed": true,
        "layer2Completed": true,
        "layer3Completed": false,
        "progressPercentage": 66.67
      }
    ],
    "quizScores": [
      {
        "quizId": 1,
        "quizTitle": "Anatomy Quiz 1",
        "score": 85,
        "percentage": 85.0,
        "completedAt": "2025-08-25T10:00:00.000Z"
      }
    ],
    "examResults": [
      {
        "examId": 1,
        "examTitle": "Midterm Exam",
        "score": 78,
        "percentage": 78.0,
        "completedAt": "2025-08-25T11:00:00.000Z"
      }
    ],
    "overallStats": {
      "totalQuizzesTaken": 5,
      "averageQuizScore": 82.5,
      "coursesInProgress": 3,
      "coursesCompleted": 1,
      "totalExamsTaken": 2,
      "averageExamScore": 75.0
    }
  }
}
```

### Update Course Progress
**PUT** `/api/v1/students/courses/{courseId}/progress`

Updates progress for a specific course layer.

**Request Body:**
```json
{
  "layer": 2,        // 1, 2, or 3
  "completed": true  // true or false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course layer 2 progress updated successfully"
}
```

---

## Common Response Format

All endpoints follow this response structure:

**Success Response:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "meta": {
    "timestamp": "2025-08-25T18:55:29.114Z",
    "requestId": "unique-request-id"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Validation failed",
    "timestamp": "2025-08-25T18:55:29.114Z",
    "requestId": "unique-request-id"
  }
}
```

### Get Quiz History
**GET** `/api/v1/students/quiz-history`

**Query Parameters:**
- `type` (string): Filter by session type (PRACTICE, EXAM, MOCK)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 1,
        "title": "Anatomy Practice Quiz",
        "type": "PRACTICE",
        "status": "COMPLETED",
        "score": 85,
        "percentage": 85.0,
        "totalQuestions": 20,
        "correctAnswers": 17,
        "completedAt": "2025-08-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalItems": 1,
      "hasMore": false
    }
  }
}
```

---

## Additional Endpoints

### Update Todo
**PUT** `/api/v1/students/todos/{todoId}`

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2025-08-30T10:00:00.000Z"
}
```

### Delete Todo
**DELETE** `/api/v1/students/todos/{todoId}`

### Update Label
**PUT** `/api/v1/students/labels/{labelId}`

**Request Body:**
```json
{
  "name": "Updated Label Name"
}
```

### Delete Label
**DELETE** `/api/v1/students/labels/{labelId}`

### Update Note
**PUT** `/api/v1/students/notes/{noteId}`

**Request Body:**
```json
{
  "noteText": "Updated note content"
}
```

### Delete Note
**DELETE** `/api/v1/students/notes/{noteId}`

---

## Example Usage

### Testing Todos Filtering

1. **Get only active todos (default behavior):**
   ```bash
   GET /api/v1/students/todos
   # Returns only PENDING and IN_PROGRESS todos
   ```

2. **Get all todos including completed:**
   ```bash
   GET /api/v1/students/todos?includeCompleted=true
   # Returns all todos regardless of status
   ```

3. **Get high priority pending todos:**
   ```bash
   GET /api/v1/students/todos?status=PENDING&priority=HIGH
   ```

### Testing Notes Grouping

1. **Get all notes grouped by module:**
   ```bash
   GET /api/v1/students/notes
   # Returns notes organized by module hierarchy
   ```

2. **Get notes for specific question:**
   ```bash
   GET /api/v1/students/notes?questionId=123
   # Returns notes filtered by question, still grouped by module
   ```

### Testing Question-based Labels

1. **Create label and add questions:**
   ```bash
   POST /api/v1/students/labels
   POST /api/v1/students/questions/123/labels/5
   GET /api/v1/students/labels/5
   # Shows questions associated with the label
   ```

---

## Data Types

- **TodoType**: READING, QUIZ, SESSION, EXAM, OTHER
- **TodoStatus**: PENDING, IN_PROGRESS, COMPLETED
- **Priority**: LOW, MEDIUM, HIGH
- **Layer**: 1, 2, 3 (course progress layers)
- **SessionType**: PRACTICE, EXAM, MOCK
