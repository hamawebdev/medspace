# Residency Session Creation API Documentation

## Overview

The Residency Session Creation API allows authorized users to create specialized quiz sessions containing only residency-level questions. These sessions are designed for medical students in their residency training and require specific authorization based on year level access or residency subscription.

## Endpoint

```
POST /api/v1/quizzes/residency-sessions
```

## Authentication

- **Required**: Bearer Token (JWT)
- **Authorization**: Users must have either:
  - `SEVEN` in their `accessible_year_levels` array, OR
  - A subscription with `pack_type === "residency"`

## Request

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | Bearer token with JWT payload |
| `Content-Type` | string | Yes | `application/json` |

### Request Body

```json
{
  "title": "string",
  "examYear": "number",
  "universityId": "number"
}
```

### Request Body Schema

| Field | Type | Required | Validation Rules | Description |
|-------|------|----------|------------------|-------------|
| `title` | string | Yes | 3-100 characters, alphanumeric + spaces, hyphens, underscores, periods, commas, exclamation marks, question marks | Session title |
| `examYear` | integer | Yes | 1900 to current year + 10 | Year of the exam |
| `universityId` | integer | Yes | Positive integer | ID of the university |

### Example Request

```bash
curl -X POST http://localhost:3005/api/v1/quizzes/residency-sessions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Residency Exam Session 2020",
    "examYear": 2020,
    "universityId": 17
  }'
```

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "sessionId": 627,
    "title": "Residency Exam Session 2020",
    "sessionType": "RESIDENCY",
    "examYear": 2020,
    "universityId": 17,
    "questionCount": 5
  },
  "meta": {
    "timestamp": "2025-09-10T19:31:00.435Z",
    "requestId": "7pygajzuef"
  }
}
```

### Success Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful requests |
| `data.sessionId` | number | Unique identifier of the created session |
| `data.title` | string | The session title (sanitized) |
| `data.sessionType` | string | Always `"RESIDENCY"` |
| `data.examYear` | number | The exam year used for filtering |
| `data.universityId` | number | The university ID used for filtering |
| `data.questionCount` | number | Number of residency questions included in the session |
| `meta.timestamp` | string | ISO 8601 timestamp of the response |
| `meta.requestId` | string | Unique request identifier for tracking |

## Error Responses

### 400 Bad Request - Validation Error

```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title must be at least 3 characters"
      }
    ],
    "timestamp": "2025-09-10T19:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### 401 Unauthorized - Invalid Token

```json
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Your session has expired or token is invalid. Please log in again.",
    "timestamp": "2025-09-10T19:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### 403 Forbidden - Access Denied

```json
{
  "success": false,
  "error": {
    "type": "ForbiddenError",
    "message": "Access denied. Residency sessions require either SEVEN year level access or residency subscription.",
    "timestamp": "2025-09-10T19:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### 402 Payment Required - No Active Subscription

```json
{
  "success": false,
  "error": {
    "type": "SubscriptionRequiredError",
    "message": "An active subscription is required to access residency sessions",
    "timestamp": "2025-09-10T19:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### 404 Not Found - No Questions Found

```json
{
  "success": false,
  "error": {
    "type": "NoQuestionsFoundError",
    "message": "No questions found matching the specified filters: examYear: 2024, universityId: 2, message: \"No residency questions found for the specified exam year and university\" not found",
    "timestamp": "2025-09-10T19:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### 500 Internal Server Error - Session Creation Failed

```json
{
  "success": false,
  "error": {
    "type": "QuizCreationFailedError",
    "message": "Failed to create quiz session: Failed to create residency session",
    "timestamp": "2025-09-10T19:30:00.000Z",
    "requestId": "abc123"
  }
}
```

## Authorization Logic

The API implements a two-tier authorization system:

### 1. Active Subscription Check
- User must have `has_active_subscription: true` in JWT payload
- If not, returns `SubscriptionRequiredError`

### 2. Residency Access Check
User must satisfy **at least one** of the following conditions:

#### Option A: Year Level Access
- User has `"SEVEN"` in their `accessible_year_levels` array
- Example JWT payload:
```json
{
  "user_data": {
    "currentYear": "SEVEN"
  },
  "subscriptions": [{
    "accessible_year_levels": ["SEVEN"]
  }]
}
```

#### Option B: Residency Subscription
- User has a subscription with `pack_type === "residency"`
- Example JWT payload:
```json
{
  "subscriptions": [{
    "pack_type": "residency"
  }]
}
```

## Session Creation Process

1. **Authorization Validation**: Verify user has required access
2. **Question Filtering**: Query `ResidencyQuestion` model joined with `Question` model
3. **Filter Application**: Apply `examYear` and `universityId` filters
4. **Session Creation**: Create `QuizSession` with:
   - `type: "RESIDENCY"`
   - `status: "NOT_STARTED"`
   - `score: 0`
   - `percentage: 0`
5. **Question Association**: Create `QuizSessionQuestion` entries for all matching questions
6. **Attempt Initialization**: Create `QuizAttempt` entries for each question

## Database Schema

### ResidencyQuestion Model
```prisma
model ResidencyQuestion {
  id         Int           @id @default(autoincrement())
  questionId Int           @unique @map("question_id")
  part       ResidencyPart

  question   Question      @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@map("residency_questions")
  @@index([questionId])
  @@index([part])
}

enum ResidencyPart {
  PART1
  PART2
  PART3
}
```

### QuizSession Model
```prisma
model QuizSession {
  id            Int      @id @default(autoincrement())
  userId        Int      @map("user_id")
  title         String
  type          SessionType @default(PRACTICE)
  status        SessionStatus @default(NOT_STARTED)
  score         Float    @default(0)
  percentage    Float    @default(0)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionQuestions QuizSessionQuestion[]
  quizAttempts  QuizAttempt[]

  @@map("quiz_sessions")
}

enum SessionType {
  PRACTICE
  EXAM
  REMEDIAL
  RESIDENCY
}
```

## Testing

### Test Data Setup

The seeder creates 75 residency questions across:
- **3 Residency Parts**: PART1, PART2, PART3
- **5 Exam Years**: 2020-2024
- **3 Universities**: IDs 17, 18, and others

### Test Cases

#### 1. Successful Session Creation
```bash
curl -X POST http://localhost:3005/api/v1/quizzes/residency-sessions \
  -H "Authorization: Bearer [VALID_TOKEN_WITH_SEVEN_ACCESS]" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Residency Exam Session 2020",
    "examYear": 2020,
    "universityId": 17
  }'
```

#### 2. Authorization Test - Unauthorized User
```bash
curl -X POST http://localhost:3005/api/v1/quizzes/residency-sessions \
  -H "Authorization: Bearer [TOKEN_WITHOUT_SEVEN_ACCESS]" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Session",
    "examYear": 2020,
    "universityId": 17
  }'
```

#### 3. No Questions Found
```bash
curl -X POST http://localhost:3005/api/v1/quizzes/residency-sessions \
  -H "Authorization: Bearer [VALID_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Non-existent Session",
    "examYear": 2025,
    "universityId": 999
  }'
```

## JWT Token Structure

### Required JWT Payload Structure
```json
{
  "user_data": {
    "id": 101,
    "email": "test@example.com",
    "fullName": "Test Student",
    "role": "STUDENT",
    "universityId": 2,
    "specialtyId": 2,
    "currentYear": "SEVEN",
    "emailVerified": true,
    "isActive": true
  },
  "subscriptions": [{
    "id": 1,
    "study_pack_id": 1,
    "pack_name": "Year 7 Medicine",
    "pack_type": "year",
    "year_number": "SEVEN",
    "end_date": "2026-08-10T14:08:32.101Z",
    "days_remaining": 335,
    "accessible_year_levels": ["SEVEN"]
  }],
  "payment_status": "active",
  "has_active_subscription": true,
  "accessible_study_packs": [1]
}
```

## Rate Limiting

- No specific rate limiting implemented
- Standard server rate limiting applies

## Caching

- No caching implemented for this endpoint
- Each request queries the database directly

## Monitoring and Logging

- All requests are logged with unique `requestId`
- Error responses include timestamps for debugging
- Failed session creations are logged with error details

## Security Considerations

1. **JWT Validation**: All requests must include valid JWT tokens
2. **Authorization Checks**: Strict validation of user permissions
3. **Input Sanitization**: Title field is sanitized before storage
4. **SQL Injection Protection**: Uses Prisma ORM with parameterized queries
5. **Data Validation**: Comprehensive input validation using Zod schemas

## Related Endpoints

- `GET /api/v1/quizzes/sessions` - List user's quiz sessions
- `GET /api/v1/quizzes/sessions/:id` - Get specific session details
- `POST /api/v1/quizzes/sessions/:id/start` - Start a quiz session
- `POST /api/v1/quizzes/sessions/:id/submit` - Submit quiz answers

## Changelog

### Version 1.0.0 (2025-09-10)
- Initial implementation of Residency Session Creation API
- Added authorization based on year level and subscription type
- Implemented filtering by exam year and university ID
- Added comprehensive error handling and validation
- Created database schema for residency questions and sessions

## Support

For technical support or questions about this API, please contact the development team or refer to the main API documentation.
