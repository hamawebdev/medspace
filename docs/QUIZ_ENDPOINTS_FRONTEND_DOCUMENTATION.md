# Quiz Endpoints - Frontend Developer Documentation

## Overview

This document provides comprehensive documentation for the three main quiz endpoints that handle exam and practice session creation and filtering. These endpoints are essential for the quiz/exam functionality in the Medcin platform.

## Base URL

```
http://localhost:3005/api/v1
```

## Authentication

All endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Session Filters

**Endpoint:** `GET /quizzes/session-filters`

**Description:** Retrieves available filter options for creating exam/practice sessions. This endpoint provides all the filterable options like universities, question sources, rotations, and years.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "id": 1,
        "name": "University of Algiers",
        "country": "Algeria"
      }
    ],
    "questionSources": [
      {
        "id": 1,
        "name": "Official Exam Questions",
        "description": "Questions from official medical exams"
      }
    ],
    "rotations": [
      "R1",
      "R2",
      "R3",
      "R4"
    ],
    "questionYears": [
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Frontend Usage:**
```javascript
const getSessionFilters = async () => {
  try {
    const response = await fetch('/api/v1/quizzes/session-filters', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      // Use data.data.universities, data.data.questionSources, etc.
      setFilterOptions(data.data);
    }
  } catch (error) {
    console.error('Error fetching session filters:', error);
  }
};
```

---

### 2. Get Question Count

**Endpoint:** `POST /quizzes/question-count`

**Description:** Returns the total number of questions available based on the provided filters. This is useful for showing users how many questions they can create sessions with before actually creating the session.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseIds": [1, 2, 3],
  "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICES"],
  "years": [2022, 2023, 2024],
  "rotations": ["R1", "R2"],
  "universityIds": [1, 2],
  "questionSourceIds": [1, 2]
}
```

**Required Fields:**
- `courseIds`: Array of course IDs (minimum 1, maximum 50)

**Optional Fields:**
- `questionTypes`: Array of question types (`"SINGLE_CHOICE"`, `"MULTIPLE_CHOICES"`)
- `years`: Array of years (1900 to current year + 10)
- `rotations`: Array of rotations (`"R1"`, `"R2"`, `"R3"`, `"R4"`)
- `universityIds`: Array of university IDs (maximum 10)
- `questionSourceIds`: Array of question source IDs (maximum 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuestionCount": 150,
    "accessibleQuestionCount": 120,
    "filtersApplied": {
      "courseIds": [1, 2, 3],
      "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICES"],
      "years": [2022, 2023, 2024],
      "rotations": ["R1", "R2"],
      "universityIds": [1, 2],
      "questionSourceIds": [1, 2]
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Frontend Usage:**
```javascript
const getQuestionCount = async (filters) => {
  try {
    const response = await fetch('/api/v1/quizzes/question-count', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filters)
    });
    
    const data = await response.json();
    if (data.success) {
      setQuestionCount(data.data.accessibleQuestionCount);
      setTotalQuestions(data.data.totalQuestionCount);
    }
  } catch (error) {
    console.error('Error getting question count:', error);
  }
};
```

---

### 3. Create Exam/Practice Session

**Endpoint:** `POST /quizzes/sessions`

**Description:** Creates a new exam or practice session with the specified number of questions based on the provided filters.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My Practice Session",
  "questionCount": 20,
  "courseIds": [1, 2, 3],
  "sessionType": "PRACTISE",
  "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICES"],
  "years": [2022, 2023, 2024],
  "rotations": ["R1", "R2"],
  "universityIds": [1, 2],
  "questionSourceIds": [1, 2]
}
```

**Required Fields:**
- `title`: Session title (3-100 characters, alphanumeric with spaces, hyphens, underscores, periods, commas, exclamation marks, question marks)
- `questionCount`: Number of questions (1-100)
- `courseIds`: Array of course IDs (minimum 1, maximum 50)
- `sessionType`: Either `"PRACTISE"` or `"EXAM"`

**Optional Fields:**
- `questionTypes`: Array of question types (`"SINGLE_CHOICE"`, `"MULTIPLE_CHOICES"`)
- `years`: Array of years (1900 to current year + 10)
- `rotations`: Array of rotations (`"R1"`, `"R2"`, `"R3"`, `"R4"`)
- `universityIds`: Array of university IDs (maximum 10)
- `questionSourceIds`: Array of question source IDs (maximum 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "title": "My Practice Session",
    "questionCount": 20,
    "filtersApplied": {
      "courseIds": [1, 2, 3],
      "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICES"],
      "years": [2022, 2023, 2024],
      "rotations": ["R1", "R2"],
      "universityIds": [1, 2],
      "questionSourceIds": [1, 2]
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or insufficient questions
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Frontend Usage:**
```javascript
const createSession = async (sessionData) => {
  try {
    const response = await fetch('/api/v1/quizzes/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });
    
    const data = await response.json();
    if (data.success) {
      // Redirect to session or show success message
      router.push(`/quiz-session/${data.data.sessionId}`);
    } else {
      // Handle validation errors
      setErrors(data.error.errors);
    }
  } catch (error) {
    console.error('Error creating session:', error);
  }
};
```

## Validation Rules

### Title Validation
- Minimum 3 characters
- Maximum 100 characters
- Allowed characters: letters, numbers, spaces, hyphens, underscores, periods, commas, exclamation marks, question marks
- Regex pattern: `^[a-zA-Z0-9\s\-_.,!?]+$`

### Question Count Validation
- Must be an integer
- Minimum 1
- Maximum 100

### Course IDs Validation
- Must be an array
- Minimum 1 course ID
- Maximum 50 course IDs
- Each ID must be a positive integer

### Question Types Validation
- Must be an array
- Maximum 2 question types
- Valid values: `"SINGLE_CHOICE"`, `"MULTIPLE_CHOICES"`

### Years Validation
- Must be an array
- Maximum 20 years
- Each year must be between 1900 and current year + 10

### Rotations Validation
- Must be an array
- Maximum 4 rotations
- Valid values: `"R1"`, `"R2"`, `"R3"`, `"R4"`

### University IDs Validation
- Must be an array
- Maximum 10 university IDs
- Each ID must be a positive integer

### Question Source IDs Validation
- Must be an array
- Maximum 10 question source IDs
- Each ID must be a positive integer

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "type": "BadRequestError",
    "message": "Request validation failed: courseIds: At least one course ID must be provided",
    "errors": [
      {
        "field": "courseIds",
        "message": "At least one course ID must be provided",
        "code": "too_small"
      }
    ]
  }
}
```

**Unauthorized Error (401):**
```json
{
  "success": false,
  "error": {
    "type": "UnauthorizedError",
    "message": "Your session has expired or token is invalid. Please log in again.",
    "timestamp": "2025-09-09T22:19:33.639Z",
    "requestId": "tod17u8jxn"
  }
}
```

**Internal Server Error (500):**
```json
{
  "success": false,
  "error": {
    "type": "InternalServerError",
    "message": "We're experiencing technical difficulties. Please try again later.",
    "timestamp": "2025-09-09T22:18:41.558Z",
    "requestId": "q9ic30l8vohnuwuzs2jt4"
  }
}
```

## Frontend Implementation Examples

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useQuizSession = () => {
  const [filters, setFilters] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('authToken');

  // Get session filters
  const getFilters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/quizzes/session-filters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setFilters(data.data);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to fetch filters');
    } finally {
      setLoading(false);
    }
  };

  // Get question count
  const getQuestionCount = async (sessionFilters) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/quizzes/question-count', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionFilters)
      });
      
      const data = await response.json();
      if (data.success) {
        setQuestionCount(data.data.accessibleQuestionCount);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to get question count');
    } finally {
      setLoading(false);
    }
  };

  // Create session
  const createSession = async (sessionData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/quizzes/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        setError(data.error.message);
        return null;
      }
    } catch (err) {
      setError('Failed to create session');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    filters,
    questionCount,
    loading,
    error,
    getFilters,
    getQuestionCount,
    createSession
  };
};

export default useQuizSession;
```

### Form Validation Example

```javascript
const validateSessionForm = (formData) => {
  const errors = {};

  // Title validation
  if (!formData.title || formData.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (formData.title.length > 100) {
    errors.title = 'Title must not exceed 100 characters';
  } else if (!/^[a-zA-Z0-9\s\-_.,!?]+$/.test(formData.title)) {
    errors.title = 'Title contains invalid characters';
  }

  // Question count validation
  if (!formData.questionCount || formData.questionCount < 1) {
    errors.questionCount = 'Question count must be at least 1';
  } else if (formData.questionCount > 100) {
    errors.questionCount = 'Question count cannot exceed 100';
  }

  // Course IDs validation
  if (!formData.courseIds || formData.courseIds.length === 0) {
    errors.courseIds = 'At least one course must be selected';
  } else if (formData.courseIds.length > 50) {
    errors.courseIds = 'Cannot select more than 50 courses';
  }

  // Session type validation
  if (!formData.sessionType || !['PRACTISE', 'EXAM'].includes(formData.sessionType)) {
    errors.sessionType = 'Session type must be either PRACTISE or EXAM';
  }

  return errors;
};
```

## Testing

### Manual Testing with cURL

```bash
# Get session filters
curl -X GET "http://localhost:3005/api/v1/quizzes/session-filters" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Get question count
curl -X POST "http://localhost:3005/api/v1/quizzes/question-count" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseIds": [1, 2],
    "questionTypes": ["SINGLE_CHOICE"],
    "years": [2023, 2024]
  }'

# Create session
curl -X POST "http://localhost:3005/api/v1/quizzes/sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Session",
    "questionCount": 10,
    "courseIds": [1, 2],
    "sessionType": "PRACTISE"
  }'
```

## Notes

1. **Caching**: The session filters endpoint uses caching (24-hour duration) for better performance.

2. **Year Level Filtering**: Questions are automatically filtered based on the user's subscription and accessible year levels.

3. **Question Availability**: The system ensures that only questions accessible to the user (based on their subscription) are included in sessions.

4. **Error Handling**: Always check the `success` field in responses and handle errors appropriately.

5. **Rate Limiting**: Be aware that there might be rate limiting in place for these endpoints.

6. **Token Expiration**: JWT tokens expire after 15 days. Implement proper token refresh logic.

## Support

For any issues or questions regarding these endpoints, please contact the backend development team or refer to the main API documentation.
