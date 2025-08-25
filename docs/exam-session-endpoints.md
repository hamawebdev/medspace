# Exam Session Endpoints Documentation

This document provides comprehensive documentation for the quiz session management endpoints that allow students to discover available questions and create custom quiz sessions.

## Table of Contents

1. [Get Exam Session Filters](#get-exam-session-filters)
2. [Create Session by Questions](#create-session-by-questions)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

---

## Get Exam Session Filters

Retrieves hierarchical filtering options for exam sessions based on the questions table data. This endpoint provides a structured view of available questions organized by unite → module → university → year.

### Endpoint Details

```
GET /api/v1/quizzes/exam-session-filters
```

### Authentication

- **Required**: Yes
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <access_token>`

### Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:** None

**Request Body:** None

### Response

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "unites": [
      {
        "id": 82,
        "title": "Basic Medical Sciences",
        "modules": [
          {
            "id": 302,
            "title": "Human Anatomy",
            "universities": [
              {
                "id": 29,
                "name": "University of Algiers",
                "years": [
                  {
                    "year": 2024,
                    "questionSingleCount": 15,
                    "questionMultipleCount": 8,
                    "questionSingleChoiceIds": [1, 2, 3, 15],
                    "questionMultipleChoiceIds": [4, 5, 6, 8]
                  },
                  {
                    "year": 9999,
                    "questionSingleCount": 7,
                    "questionMultipleCount": 1,
                    "questionSingleChoiceIds": [664, 665, 666, 667, 668, 669, 670],
                    "questionMultipleChoiceIds": [676]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "meta": {
    "timestamp": "2025-08-18T15:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful responses |
| `data.unites` | array | Array of unite objects |
| `data.unites[].id` | number | Unique identifier for the unite |
| `data.unites[].title` | string | Name of the unite |
| `data.unites[].modules` | array | Array of module objects within the unite |
| `data.unites[].modules[].id` | number | Unique identifier for the module |
| `data.unites[].modules[].title` | string | Name of the module |
| `data.unites[].modules[].universities` | array | Array of university objects |
| `data.unites[].modules[].universities[].id` | number | Unique identifier for the university |
| `data.unites[].modules[].universities[].name` | string | Name of the university |
| `data.unites[].modules[].universities[].years` | array | Array of year objects |
| `data.unites[].modules[].universities[].years[].year` | number | Exam year (9999 indicates "No Year Specified") |
| `data.unites[].modules[].universities[].years[].questionSingleCount` | number | Count of single-choice questions |
| `data.unites[].modules[].universities[].years[].questionMultipleCount` | number | Count of multiple-choice questions |
| `data.unites[].modules[].universities[].years[].questionSingleChoiceIds` | array | Array of single-choice question IDs |
| `data.unites[].modules[].universities[].years[].questionMultipleChoiceIds` | array | Array of multiple-choice question IDs |

### Access Control

- **Regular Students**: See only questions from their accessible study packs based on subscription
- **Residency Students**: Have access to ALL study packs and questions
- **Subscription Required**: Active subscription is mandatory

### Special Notes

- **Year 9999**: Represents questions without a specified exam year
- **Hierarchical Structure**: Data is sorted alphabetically (unites, modules, universities) and years in descending order
- **Question Counts**: The sum of all question counts equals the total accessible questions for the user
- **Real-time Data**: Results reflect the current state of the database

---

## Create Session by Questions

Creates a custom quiz/exam session using specific question IDs. This endpoint allows students to create personalized sessions by selecting specific questions from the hierarchical filters.

### Endpoint Details

```
POST /api/v1/quizzes/create-session-by-questions
```

### Authentication

- **Required**: Yes
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <access_token>`

### Request

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "EXAM",
  "questionIds": [123, 456, 789]
}
```

### Request Schema

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `type` | string | Yes | Type of session | Must be "EXAM" |
| `questionIds` | array | Yes | Array of question IDs | 1-100 unique positive integers |

### Validation Rules

- **type**: Must be exactly "EXAM" (case-sensitive)
- **questionIds**: 
  - Must contain at least 1 question ID
  - Maximum 100 question IDs per session
  - All IDs must be positive integers
  - All IDs must be unique (no duplicates)
  - All IDs must exist in the database
  - User must have access to all specified questions

### Response

**Success Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "sessionId": 863,
    "type": "EXAM",
    "questionCount": 3,
    "status": "NOT_STARTED",
    "createdAt": "2025-08-18T15:33:05.623Z"
  },
  "meta": {
    "timestamp": "2025-08-18T15:33:05.636Z",
    "requestId": "19vrx8mhsac"
  }
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful responses |
| `data.sessionId` | number | Unique identifier for the created session |
| `data.type` | string | Type of session ("EXAM") |
| `data.questionCount` | number | Number of questions in the session |
| `data.status` | string | Initial status of the session ("NOT_STARTED") |
| `data.createdAt` | string | ISO 8601 timestamp of session creation |

### Access Control

- **Question Access Validation**: All question IDs must be accessible based on user's subscription
- **Study Pack Restrictions**: Regular users limited to their accessible study packs
- **Residency Access**: Residency users can access questions from all study packs
- **Subscription Required**: Active subscription is mandatory

---

## Authentication

Both endpoints require JWT authentication with an active subscription.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### JWT Token Requirements

- **Valid Token**: Must be a valid, non-expired JWT token
- **Active Subscription**: User must have an active subscription
- **Proper Claims**: Token must contain required user data and subscription information

### Getting a Token

```bash
# Login to get access token
curl -X POST "http://localhost:3005/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

---

## Error Handling

### Common Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Authorization header is required. Please include your access token.",
    "timestamp": "2025-08-18T15:30:00.000Z",
    "requestId": "abc123"
  }
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "type": "ForbiddenError",
    "message": "You don't have access to questions: 123, 456",
    "timestamp": "2025-08-18T15:30:00.000Z",
    "requestId": "abc123"
  }
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Request validation failed: type: Type must be 'EXAM'",
    "timestamp": "2025-08-18T15:30:00.000Z",
    "requestId": "abc123"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Question IDs not found: 99999, 88888",
    "timestamp": "2025-08-18T15:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### Error Types by Endpoint

#### Get Exam Session Filters
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: No active subscription
- `500 Internal Server Error`: Database or server errors

#### Create Session by Questions
- `400 Bad Request`: Invalid request body, validation errors
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: No access to specified questions or no active subscription
- `404 Not Found`: Question IDs don't exist
- `500 Internal Server Error`: Database or server errors

---

## Examples

### Complete Workflow Example

#### Step 1: Get Available Questions

```bash
# Get exam session filters
curl -X GET "http://localhost:3005/api/v1/quizzes/exam-session-filters" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unites": [
      {
        "id": 82,
        "title": "Basic Medical Sciences",
        "modules": [
          {
            "id": 302,
            "title": "Human Anatomy",
            "universities": [
              {
                "id": 29,
                "name": "University of Algiers",
                "years": [
                  {
                    "year": 2024,
                    "questionSingleCount": 5,
                    "questionMultipleCount": 3,
                    "questionSingleChoiceIds": [664, 665, 666, 667, 668],
                    "questionMultipleChoiceIds": [809, 810, 811]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Step 2: Create Custom Session

```bash
# Create exam session with selected questions
curl -X POST "http://localhost:3005/api/v1/quizzes/create-session-by-questions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EXAM",
    "questionIds": [664, 665, 809]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": 864,
    "type": "EXAM",
    "questionCount": 3,
    "status": "NOT_STARTED",
    "createdAt": "2025-08-18T15:35:00.000Z"
  }
}
```

### Error Examples

#### Invalid Question IDs

```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/create-session-by-questions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EXAM",
    "questionIds": [99999]
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Question IDs not found: 99999",
    "timestamp": "2025-08-18T15:30:00.000Z",
    "requestId": "abc123"
  }
}
```

#### Invalid Session Type

```bash
curl -X POST "http://localhost:3005/api/v1/quizzes/create-session-by-questions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INVALID",
    "questionIds": [664]
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Request validation failed: type: Type must be 'EXAM'",
    "timestamp": "2025-08-18T15:30:00.000Z",
    "requestId": "abc123"
  }
}
```

### JavaScript/Frontend Integration

```javascript
// Get exam session filters
async function getExamFilters(token) {
  const response = await fetch('/api/v1/quizzes/exam-session-filters', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Create custom session
async function createCustomSession(token, type, questionIds) {
  const response = await fetch('/api/v1/quizzes/create-session-by-questions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: type,
      questionIds: questionIds
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return await response.json();
}

// Usage example
try {
  const filters = await getExamFilters(userToken);
  const questionIds = filters.data.unites[0].modules[0].universities[0].years[0].questionSingleChoiceIds.slice(0, 5);
  
  const session = await createCustomSession(userToken, 'EXAM', questionIds);
  console.log('Session created:', session.data.sessionId);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## Rate Limiting

- **Get Exam Session Filters**: No specific rate limiting (cached data)
- **Create Session by Questions**: Standard API rate limits apply
- **Recommendation**: Cache filter results on the frontend to reduce API calls

## Performance Notes

- **Filters Endpoint**: Results are optimized and sorted for frontend consumption
- **Session Creation**: Validates all questions in a single database transaction
- **Caching**: Consider caching filter results for better user experience
- **Pagination**: Not implemented - all accessible data is returned

## Security Considerations

- **JWT Validation**: All requests are validated against active JWT tokens
- **Access Control**: Questions are filtered based on user subscription and study pack access
- **Input Validation**: All inputs are validated using Zod schemas
- **SQL Injection**: Protected by Prisma ORM parameterized queries
- **Rate Limiting**: Standard API rate limiting applies

---

*Last Updated: August 18, 2025*
*API Version: v1*
