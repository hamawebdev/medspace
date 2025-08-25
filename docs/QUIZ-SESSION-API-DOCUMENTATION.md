# Quiz Session Creation API - Comprehensive Documentation

## 📋 Overview

This document provides complete documentation for the quiz session creation functionality, including all implemented filtering capabilities, validation rules, and API endpoints.

## 🔗 API Endpoints

### **1. Create Quiz Session**
```
POST /api/v1/quizzes/quiz-sessions
```

### **2. Get Available Filters**
```
GET /api/v1/quizzes/quiz-filters
```

### **3. Create Retake Session**
```
POST /api/v1/quiz-sessions/retake
```

## 🔐 Authentication & Authorization

### **Required Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Access Requirements:**
- ✅ **Valid JWT Token** - User must be authenticated
- ✅ **Active Subscription** - User must have an active subscription
- ✅ **Payment Status** - User's payment must be current

## 📝 Request Schema

### **Create Quiz Session Request Body:**
```typescript
{
  title: string;                    // Required: 3-100 chars, alphanumeric + -_.,!?
  quizType?: QuizType;             // Optional: "QCM" | "QCS" | "PRACTICE" | "EXAM"
  settings: {
    questionCount: number;          // Required: 1-100
  };
  filters: QuizSessionFilters;      // Required: At least one filter must be provided
}
```

### **QuizSessionFilters Interface:**
```typescript
{
  yearLevels?: YearLevel[];         // Optional: ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN"]
  uniteIds?: number[];             // Optional: Max 10 unite IDs
  moduleIds?: number[];            // Optional: Max 20 module IDs  
  courseIds?: number[];            // Optional: Max 50 course IDs
  questionTypes?: QuestionType[];   // Optional: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"]
  examYears?: number[];            // Optional: 1900-2035, max 20 years
  quizSourceIds?: number[];        // Optional: Max 10 quiz source IDs (NEW FEATURE)
}
```

## 🎯 Validation Rules

### **Title Validation:**
- **Length**: 3-100 characters
- **Characters**: Only `a-zA-Z0-9\s\-_.,!?` allowed
- **Examples**:
  - ✅ `"Medical Practice Quiz"`
  - ✅ `"Anatomy Review - Part 1!"`
  - ❌ `"Quiz: Advanced Topics"` (contains colon)
  - ❌ `"John's Quiz"` (contains apostrophe)

### **Settings Validation:**
- **questionCount**: Integer between 1-100

### **Filters Validation:**
- **At least one filter required**: Cannot create quiz with empty filters
- **Array limits**: Each filter type has specific limits (see schema above)
- **Positive integers**: All ID fields must be positive integers
- **Empty arrays**: Empty arrays are ignored (not rejected)

### **Automatic Year Level Detection:**
If `yearLevels` is not provided, the system automatically uses the user's current year level.

## 📊 Response Schemas

### **Successful Quiz Session Creation:**
```json
{
  "success": true,
  "data": {
    "sessionId": 123
  }
}
```

### **Available Filters Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 10,
        "name": "Basic Anatomy",
        "module": {
          "id": 12,
          "name": "Human Anatomy",
          "unite": {
            "id": 14,
            "name": "Basic Medical Sciences"
          }
        }
      }
    ],
    "universities": [
      {
        "id": 4,
        "name": "Medical University"
      }
    ],
    "examYears": [2023, 2024],
    "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"],
    "quizSources": [
      { "id": 7, "name": "Medical Board Exams" },
      { "id": 8, "name": "University Exams" },
      { "id": 9, "name": "Practice Tests" },
      { "id": 10, "name": "Residency Exams" },
      { "id": 11, "name": "International Medical Exams" },
      { "id": 12, "name": "Mock Exams" }
    ]
  }
}
```

## 🚨 Error Responses

### **Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Validation failed: Title contains invalid characters",
    "timestamp": "2025-08-06T13:45:30.123Z",
    "requestId": "req_abc123"
  }
}
```

### **No Questions Found (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "type": "NoQuestionsFoundError",
    "message": "No questions found matching the specified filters: courseIds: [999], questionTypes: [\"SINGLE_CHOICE\"]",
    "timestamp": "2025-08-06T13:45:30.123Z",
    "requestId": "req_abc123"
  }
}
```

### **Insufficient Questions (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "type": "InsufficientQuestionsError", 
    "message": "Insufficient questions: requested 20, available 5",
    "timestamp": "2025-08-06T13:45:30.123Z",
    "requestId": "req_abc123"
  }
}
```

### **Subscription Required (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "type": "SubscriptionRequiredError",
    "message": "Active subscription required to access quiz sessions",
    "timestamp": "2025-08-06T13:45:30.123Z",
    "requestId": "req_abc123"
  }
}
```

### **Authentication Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Invalid or expired token",
    "timestamp": "2025-08-06T13:45:30.123Z",
    "requestId": "req_abc123"
  }
}
```

## 📚 Real Database Values

### **Available Courses:**
- **ID 10**: Basic Anatomy (Module 12: Human Anatomy)
- **ID 11**: Advanced Anatomy (Module 12: Human Anatomy)
- **ID 12**: Cardiac Physiology (Module 13: Human Physiology)
- **ID 13**: Respiratory Physiology (Module 13: Human Physiology)
- **ID 14**: General Pathology (Module 14: Pathology)

### **Available Modules:**
- **ID 12**: Human Anatomy
- **ID 13**: Human Physiology
- **ID 14**: Pathology

### **Available Quiz Sources:**
- **ID 7**: Medical Board Exams
- **ID 8**: University Exams
- **ID 9**: Practice Tests
- **ID 10**: Residency Exams
- **ID 11**: International Medical Exams
- **ID 12**: Mock Exams

### **Available Question Types:**
- **SINGLE_CHOICE**: Single correct answer questions
- **MULTIPLE_CHOICE**: Multiple correct answers questions

### **Available Quiz Types:**
- **QCM**: Questions à Choix Multiples (Multiple Choice Questions)
- **QCS**: Questions à Choix Simple (Single Choice Questions)
- **PRACTICE**: General practice quiz
- **EXAM**: Exam-style quiz

## 🔧 Request Examples

### **1. Basic Course Filtering**
```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Basic Anatomy Practice",
    "settings": {
      "questionCount": 10
    },
    "filters": {
      "courseIds": [10]
    }
  }'
```

### **2. Question Type Filtering**
```bash
# Single Choice Questions Only
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Single Choice Quiz",
    "quizType": "QCS",
    "settings": {
      "questionCount": 15
    },
    "filters": {
      "courseIds": [10, 11],
      "questionTypes": ["SINGLE_CHOICE"]
    }
  }'

# Multiple Choice Questions Only
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Multiple Choice Quiz",
    "quizType": "QCM",
    "settings": {
      "questionCount": 10
    },
    "filters": {
      "courseIds": [12, 13],
      "questionTypes": ["MULTIPLE_CHOICE"]
    }
  }'

# Mixed Question Types
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mixed Questions Quiz",
    "settings": {
      "questionCount": 20
    },
    "filters": {
      "moduleIds": [12, 13],
      "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"]
    }
  }'
```

### **3. Quiz Source Filtering (NEW FEATURE)**
```bash
# Medical Board Exams Only
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Medical Board Practice",
    "settings": {
      "questionCount": 25
    },
    "filters": {
      "quizSourceIds": [7]
    }
  }'

# Multiple Quiz Sources
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Comprehensive Exam Prep",
    "settings": {
      "questionCount": 30
    },
    "filters": {
      "quizSourceIds": [7, 8, 10]
    }
  }'
```

### **4. Exam Year Filtering**
```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2023 Exam Questions",
    "settings": {
      "questionCount": 15
    },
    "filters": {
      "courseIds": [10, 11],
      "examYears": [2023]
    }
  }'
```

### **5. Combined Filtering Scenarios**
```bash
# Course + Question Type + Quiz Source
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Anatomy Board Prep",
    "quizType": "QCS",
    "settings": {
      "questionCount": 20
    },
    "filters": {
      "courseIds": [11],
      "questionTypes": ["SINGLE_CHOICE"],
      "quizSourceIds": [7, 10]
    }
  }'

# Module + Exam Year + Question Type
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "2024 Physiology Review",
    "settings": {
      "questionCount": 25
    },
    "filters": {
      "moduleIds": [13],
      "examYears": [2024],
      "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"]
    }
  }'

# Maximum Filtering (All Filter Types)
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Comprehensive Filtered Quiz",
    "quizType": "PRACTICE",
    "settings": {
      "questionCount": 50
    },
    "filters": {
      "yearLevels": ["ONE", "TWO"],
      "moduleIds": [12, 13],
      "courseIds": [10, 11, 12],
      "questionTypes": ["SINGLE_CHOICE"],
      "examYears": [2023, 2024],
      "quizSourceIds": [7, 8, 9]
    }
  }'
```

### **6. Get Available Filters**
```bash
curl -X GET "http://localhost:3005/api/v1/quizzes/quiz-filters" \
  -H "Authorization: Bearer <jwt_token>"
```

## 🔄 Retake Session Creation

### **Retake Session Request Schema:**
```typescript
{
  originalSessionId: number;        // Required: ID of completed session
  retakeType: RetakeType;          // Required: "SAME" | "INCORRECT_ONLY" | "CORRECT_ONLY" | "NOT_RESPONDED"
  title?: string;                  // Optional: Custom title (follows same validation as regular titles)
}
```

### **Retake Session Examples:**
```bash
# Same Questions Retake
curl -X POST "http://localhost:3005/api/v1/quiz-sessions/retake" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "originalSessionId": 123,
    "retakeType": "SAME",
    "title": "Anatomy Review - Retake"
  }'

# Incorrect Questions Only
curl -X POST "http://localhost:3005/api/v1/quiz-sessions/retake" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "originalSessionId": 123,
    "retakeType": "INCORRECT_ONLY"
  }'

# Unanswered Questions Only
curl -X POST "http://localhost:3005/api/v1/quiz-sessions/retake" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "originalSessionId": 123,
    "retakeType": "NOT_RESPONDED",
    "title": "Complete Unanswered Questions"
  }'
```

### **Retake Session Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": 124,
    "retakeType": "INCORRECT_ONLY",
    "originalSessionId": 123,
    "questionCount": 8,
    "message": "Retake session created successfully with 8 questions"
  }
}
```

## 🚨 Edge Cases and Error Scenarios

### **1. Invalid Filter Combinations**
```bash
# Empty filters (will fail)
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Empty Filters Test",
    "settings": {"questionCount": 10},
    "filters": {}
  }'
# Response: 400 - "At least one filter must be provided"
```

### **2. Exceeded Limits**
```bash
# Too many question types
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Limit Test",
    "settings": {"questionCount": 101},
    "filters": {"courseIds": [10]}
  }'
# Response: 400 - "Question count cannot exceed 100"

# Too many quiz sources
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Too Many Sources",
    "settings": {"questionCount": 10},
    "filters": {
      "quizSourceIds": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
    }
  }'
# Response: 400 - "Cannot select more than 10 quiz sources"
```

### **3. Non-existent Resource IDs**
```bash
# Non-existent course ID
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Non-existent Course",
    "settings": {"questionCount": 10},
    "filters": {"courseIds": [999]}
  }'
# Response: 404 - "No questions found matching the specified filters"

# Non-existent quiz source ID
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Non-existent Quiz Source",
    "settings": {"questionCount": 10},
    "filters": {"quizSourceIds": [999]}
  }'
# Response: 404 - "No questions found matching the specified filters"
```

### **4. Invalid Data Types**
```bash
# String instead of number for questionCount
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invalid Type Test",
    "settings": {"questionCount": "ten"},
    "filters": {"courseIds": [10]}
  }'
# Response: 400 - "Question count must be an integer"

# Negative quiz source ID
curl -X POST "http://localhost:3005/api/v1/quizzes/quiz-sessions" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Negative ID Test",
    "settings": {"questionCount": 10},
    "filters": {"quizSourceIds": [-1]}
  }'
# Response: 400 - "Invalid quiz source ID"
```

### **5. Retake Session Errors**
```bash
# Retake non-completed session
curl -X POST "http://localhost:3005/api/v1/quiz-sessions/retake" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "originalSessionId": 123,
    "retakeType": "SAME"
  }'
# Response: 400 - "Session must be in COMPLETED status. Current status: NOT_STARTED"

# Non-existent original session
curl -X POST "http://localhost:3005/api/v1/quiz-sessions/retake" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "originalSessionId": 999,
    "retakeType": "SAME"
  }'
# Response: 404 - "Quiz session '999' not found or does not belong to you"
```

## 🏗️ Implementation Details

### **Codebase Analysis:**

#### **1. Quiz Service (`src/modules/quizzes/quiz.service.ts`)**
- **createQuizSession()**: Main session creation logic
- **Subscription validation**: Checks `user.has_active_subscription`
- **Question count limits**: 1-100 questions per session
- **Filter conversion**: Converts `QuizSessionFilters` to `UnifiedQuestionFilters`
- **Error handling**: Throws specific errors for different failure scenarios

#### **2. Question Service (`src/modules/questions/question.service.ts`)**
- **getQuestionsWithFilters()**: Core filtering logic
- **Quiz source filtering**: Uses `quizQuestions.some.quiz.quizSourceId` relation
- **getAvailableFilters()**: Returns all available filter options
- **Database optimization**: Includes related data in single query

#### **3. Validation Middleware (`src/middleware/validation.middleware.ts`)**
- **createQuizSessionSchema**: Zod schema for request validation
- **Automatic year level detection**: Uses user's current year if not specified
- **Filter validation**: Ensures at least one filter is provided
- **Array limits**: Enforces maximum array sizes for each filter type

#### **4. Error Handling (`src/core/errors/QuizErrors.ts`)**
- **NoQuestionsFoundError**: 404 when no questions match filters
- **InsufficientQuestionsError**: 400 when not enough questions available
- **SubscriptionRequiredError**: 403 when user lacks active subscription
- **InvalidQuizConfigurationError**: 400 for invalid settings

### **Database Query Structure:**
```sql
-- Simplified representation of the filtering query
SELECT q.* FROM questions q
JOIN courses c ON q.course_id = c.id
JOIN modules m ON c.module_id = m.id
JOIN unites u ON m.unite_id = u.id
LEFT JOIN quiz_questions qq ON q.id = qq.question_id
LEFT JOIN quizzes qz ON qq.quiz_id = qz.id
WHERE u.study_pack_id IN (accessible_study_packs)
  AND c.id IN (courseIds)                    -- Course filtering
  AND m.id IN (moduleIds)                    -- Module filtering
  AND u.id IN (uniteIds)                     -- Unite filtering
  AND q.question_type IN (questionTypes)     -- Question type filtering
  AND q.exam_year IN (examYears)             -- Exam year filtering
  AND qz.quiz_source_id IN (quizSourceIds)   -- Quiz source filtering (NEW)
ORDER BY q.created_at DESC, q.id ASC
LIMIT questionCount;
```

## 🔧 Integration with Recent Features

### **1. Quiz Source Filtering (NEW)**
- **Purpose**: Filter questions by their source (textbooks, exam banks, etc.)
- **Implementation**: Questions → Quizzes → Quiz Sources relationship
- **API Integration**: Added to filters response and validation schema
- **Backward Compatibility**: Optional field, existing functionality unchanged

### **2. Automatic Year Level Detection**
- **Purpose**: Simplify quiz creation by auto-detecting user's year
- **Implementation**: Middleware automatically adds user's `currentYear` if not specified
- **User Experience**: Students don't need to specify their year level explicitly
- **Override**: Users can still specify different year levels if needed

### **3. Enhanced Question Type Support**
- **SINGLE_CHOICE**: Traditional single-answer questions
- **MULTIPLE_CHOICE**: Questions with multiple correct answers
- **Mixed Support**: Can combine both types in single quiz
- **Quiz Type Integration**: QCM/QCS types work with question type filtering

### **4. Retake Session Functionality**
- **SAME**: Exact same questions as original session
- **INCORRECT_ONLY**: Only questions answered incorrectly
- **CORRECT_ONLY**: Only questions answered correctly
- **NOT_RESPONDED**: Only questions that weren't answered
- **Requirements**: Original session must be COMPLETED
- **Title Generation**: Auto-generates titles if not provided

## 📈 Performance Considerations

### **Database Optimization:**
- ✅ **Indexed Fields**: All filter fields are properly indexed
- ✅ **Efficient Joins**: Uses Prisma's optimized join queries
- ✅ **Selective Filtering**: Only queries accessible study packs
- ✅ **Limit Enforcement**: Always uses LIMIT to prevent large result sets

### **API Response Optimization:**
- ✅ **Minimal Data**: Returns only essential session information
- ✅ **Structured Errors**: Consistent error format across all endpoints
- ✅ **Request Validation**: Early validation prevents unnecessary database queries

## 🔒 Security Features

### **Access Control:**
- ✅ **JWT Authentication**: All endpoints require valid JWT tokens
- ✅ **Subscription Validation**: Active subscription required for all operations
- ✅ **Study Pack Filtering**: Users only see questions from their accessible study packs
- ✅ **Session Ownership**: Users can only access their own sessions

### **Input Validation:**
- ✅ **SQL Injection Prevention**: Prisma ORM prevents SQL injection
- ✅ **XSS Prevention**: Title validation prevents malicious characters
- ✅ **Rate Limiting**: Built-in protection against abuse
- ✅ **Data Type Validation**: Strict type checking on all inputs

## 🎯 Best Practices

### **For Frontend Developers:**
1. **Always validate locally**: Check filters before sending requests
2. **Handle 404 gracefully**: NoQuestionsFoundError is common and expected
3. **Cache filter data**: Quiz filters don't change frequently
4. **Show loading states**: Quiz creation can take a few seconds
5. **Provide fallbacks**: Offer alternative filters when no questions found

### **For API Consumers:**
1. **Use specific filters**: More specific filters = better performance
2. **Reasonable question counts**: Start with smaller counts (10-20)
3. **Handle retries**: Network issues can occur, implement retry logic
4. **Monitor quotas**: Respect rate limits and subscription boundaries
5. **Log errors properly**: Include request IDs for debugging

---

**Last Updated**: August 2025
**API Version**: v1
**Documentation Version**: 2.0
