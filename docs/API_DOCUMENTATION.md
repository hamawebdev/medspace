# Medcin Platform API Documentation

## Overview

The Medcin Platform is a comprehensive medical education system built with Node.js, Express, TypeScript, and Prisma. It provides a robust API for managing medical quizzes, exams, student progress, and educational content.

**Base URL:** `http://localhost:3005/api/v1`

## Table of Contents

1. [Authentication](#authentication)
2. [Health Check](#health-check)
3. [Public Content Access](#public-content-access)
4. [Quiz System](#quiz-system)
5. [Exam System](#exam-system)
6. [Student Management](#student-management)
7. [Admin & Content Management](#admin--content-management)
8. [Media & File Upload](#media--file-upload)
9. [Error Handling](#error-handling)
10. [Response Formats](#response-formats)

## Health Check

### System Health Check
```http
GET /health
```

**Description:** Health check endpoint for Docker and monitoring systems.

**Authentication:** None required

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "medcin-backend"
}
```

## Public Content Access

### Get Universities
```http
GET /universities
```

**Description:** Get list of all universities (public access).

**Authentication:** None required

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
    ]
  }
}
```

### Get Specialties
```http
GET /specialties
```

**Description:** Get list of all medical specialties (public access).

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "data": {
    "specialties": [
      {
        "id": 1,
        "name": "General Medicine"
      }
    ]
  }
}
```

## Authentication

All API endpoints (except public auth endpoints) require authentication via JWT Bearer tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Role-Based Access Control

The API supports three user roles:
- **STUDENT**: Access to learning content, quizzes, and personal progress
- **EMPLOYEE**: Content creation and management capabilities
- **ADMIN**: Full system administration access

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "+213123456789",
  "universityId": 1,
  "specialtyId": 1,
  "currentYear": "THREE"
}
```

**Validation Rules:**
- `email`: Valid email format (required)
- `password`: Minimum 4 characters (required)
- `fullName`: Minimum 2 characters (required)
- `phoneNumber`: Optional string
- `universityId`: Optional positive integer
- `specialtyId`: Optional positive integer
- `currentYear`: Enum value (ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN), defaults to ONE

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Valid email format (required)
- `password`: Non-empty string (required)

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "email_verification_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "password_reset_token_here",
  "newPassword": "newpassword123"
}
```

**Validation Rules:**
- `token`: Non-empty string (required)
- `newPassword`: Minimum 4 characters (required)

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@example.com",
    "fullName": "John Doe",
    "role": "STUDENT",
    "universityId": 1,
    "specialtyId": 1,
    "currentYear": "THREE",
    "emailVerified": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "John Smith",
  "universityId": 2,
  "specialtyId": 3,
  "currentYear": "FOUR"
}
```

**Validation Rules:**
- `fullName`: Minimum 2 characters (optional)
- `universityId`: Positive integer (optional)
- `specialtyId`: Positive integer (optional)
- `currentYear`: Enum value (optional)
- At least one field must be provided

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "student@example.com",
    "fullName": "John Smith",
    "universityId": 2,
    "specialtyId": 3,
    "currentYear": "FOUR"
  }
}
```

#### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Validation Rules:**
- `currentPassword`: Non-empty string (required)
- `newPassword`: Minimum 4 characters (required)

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "student@example.com",
    "fullName": "John Doe",
    "role": "STUDENT",
    "universityId": 1,
    "specialtyId": 1,
    "currentYear": "THREE",
    "emailVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "universityId": 2,
  "currentYear": "FOUR"
}
```

#### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "student@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Authentication Validation Rules

#### Registration Validation
- **email**: Valid email format required
- **password**: Minimum 4 characters
- **fullName**: Minimum 2 characters
- **universityId**: Optional positive integer
- **specialtyId**: Optional positive integer
- **currentYear**: Valid YearLevel enum (ONE, TWO, THREE, FOUR, FIVE, SIX, SEVEN)

#### Login Validation
- **email**: Valid email format required
- **password**: Required, minimum 1 character

#### Password Change Validation
- **currentPassword**: Required
- **newPassword**: Minimum 4 characters

### User Roles

The system supports three user roles:

1. **STUDENT**: Default role for registered users
   - Access to quiz sessions, exams, progress tracking
   - Cannot create or modify content

2. **EMPLOYEE**: Content creator role
   - Can create and manage quizzes, exams, questions
   - Access to admin endpoints for content management

3. **ADMIN**: Full system access
   - All employee permissions
   - User management, system configuration
   - Access to analytics and reports

## Quiz System

The quiz system supports multiple question types including single choice (QCS) and multiple choice (QCM) questions. All quiz endpoints require authentication and active subscription.

### Quiz Session Creation

#### Create Quiz Session
```http
POST /quizzes/quiz-sessions
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create a dynamic quiz session with customizable filters and settings.

**Authentication:** Required (Student role + active subscription)

**Request Body:**
```json
{
  "title": "Anatomy Practice Quiz",
  "quizType": "QCM",
  "settings": {
    "questionCount": 20
  },
  "filters": {
    "yearLevels": ["THREE", "FOUR"],
    "uniteIds": [1, 2],
    "moduleIds": [5, 6],
    "courseIds": [10, 11],
    "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"],
    "examYears": [2023, 2024],
    "quizSourceIds": [1, 2]
  }
}
```

**Validation Rules:**
- `title`: 3-100 characters, alphanumeric with basic punctuation (required)
- `quizType`: Enum value (QCM, QCS) (optional)
- `settings.questionCount`: 1-100 integer (required)
- `filters.yearLevels`: Array of year levels, max 7 items (optional)
- `filters.uniteIds`: Array of positive integers, max 10 items (optional)
- `filters.moduleIds`: Array of positive integers, max 20 items (optional)
- `filters.courseIds`: Array of positive integers, max 50 items (optional)
- `filters.questionTypes`: Array of question types, max 2 items (optional)
- `filters.examYears`: Array of years (1900-current+10), max 20 items (optional)
- `filters.quizSourceIds`: Array of positive integers, max 10 items (optional)
- At least one filter must be provided (if yearLevels not provided, user's current year is used)

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 123,
      "title": "Anatomy Practice Quiz",
      "quizType": "QCM",
      "status": "NOT_STARTED",
      "questionCount": 20,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "userId": 1
    },
    "questions": [
      {
        "id": 1,
        "questionText": "Which of the following are parts of the cardiovascular system?",
        "questionType": "MULTIPLE_CHOICE",
        "answers": [
          {
            "id": 1,
            "answerText": "Heart",
            "isCorrect": true
          },
          {
            "id": 2,
            "answerText": "Blood vessels",
            "isCorrect": true
          },
          {
            "id": 3,
            "answerText": "Lungs",
            "isCorrect": false
          },
          {
            "id": 4,
            "answerText": "Blood",
            "isCorrect": true
          }
        ]
      }
    ],
    "totalQuestions": 20
  }
}
```

#### Get Quiz Filters
```http
GET /quizzes/quiz-filters
Authorization: Bearer <access_token>
```

**Description:** Get available filter options for quiz creation.

**Authentication:** Required (Student role + active subscription)

**Response:**
```json
{
  "success": true,
  "data": {
    "yearLevels": ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN"],
    "unites": [
      {
        "id": 1,
        "name": "Basic Sciences",
        "modules": [
          {
            "id": 1,
            "name": "Anatomy",
            "courses": [
              {
                "id": 1,
                "name": "Human Anatomy"
              }
            ]
          }
        ]
      }
    ],
    "questionTypes": ["SINGLE_CHOICE", "MULTIPLE_CHOICE"],
    "quizSources": [
      {
        "id": 1,
        "name": "University Exams"
      }
    ],
    "availableYears": [2020, 2021, 2022, 2023, 2024]
  }
}
```

### Quiz Session Management

#### Get User Quiz Sessions
```http
GET /quiz-sessions
Authorization: Bearer <access_token>
```

**Description:** Get paginated list of user's quiz sessions.

**Authentication:** Required (Student role + active subscription)

**Query Parameters:**
- `page`: Page number (1-1000, default: 1)
- `limit`: Items per page (1-100, default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 123,
        "title": "Anatomy Practice Quiz",
        "status": "COMPLETED",
        "score": 18.5,
        "percentage": 92.5,
        "questionCount": 20,
        "completedAt": "2024-01-01T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Quiz Session Details
```http
GET /quiz-sessions/{sessionId}
Authorization: Bearer <access_token>
```

**Description:** Retrieve detailed information about a specific quiz session.

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `sessionId`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Anatomy Practice Quiz",
    "status": "IN_PROGRESS",
    "score": 15.5,
    "percentage": 77.5,
    "questionCount": 20,
    "startedAt": "2024-01-01T10:00:00.000Z",
    "questions": [
      {
        "id": 1,
        "questionText": "Which of the following are parts of the cardiovascular system?",
        "questionType": "MULTIPLE_CHOICE",
        "explanation": "The cardiovascular system consists of the heart, blood vessels, and blood.",
        "answers": [
          {
            "id": 1,
            "answerText": "Heart",
            "isCorrect": true
          },
          {
            "id": 2,
            "answerText": "Blood vessels",
            "isCorrect": true
          },
          {
            "id": 3,
            "answerText": "Lungs",
            "isCorrect": false
          },
          {
            "id": 4,
            "answerText": "Blood",
            "isCorrect": true
          }
        ],
        "userAnswer": {
          "selectedAnswerIds": [1, 2, 4],
          "isCorrect": true,
          "answeredAt": "2024-01-01T10:05:00.000Z"
        }
      }
    ]
  }
}
```

#### Submit Quiz Answers
```http
POST /quiz-sessions/{sessionId}/submit-answer
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Submit answers for quiz questions. Supports both single choice and multiple choice questions.

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `sessionId`: Positive integer (required)

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedAnswerIds": [1, 2, 4]
    },
    {
      "questionId": 2,
      "selectedAnswerId": 5
    }
  ]
}
```

**Validation Rules:**
- `answers`: Array of 1-100 answer objects (required)
- `answers[].questionId`: Positive integer (required)
- `answers[].selectedAnswerId`: Positive integer (for single choice, mutually exclusive with selectedAnswerIds)
- `answers[].selectedAnswerIds`: Array of positive integers, min 1 item (for multiple choice, mutually exclusive with selectedAnswerId)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "questionId": 1,
        "isCorrect": true,
        "score": 1.0,
        "explanation": "Correct! Heart, blood vessels, and blood are all components of the cardiovascular system."
      },
      {
        "questionId": 2,
        "isCorrect": false,
        "score": 0.0,
        "explanation": "Incorrect. The correct answer is..."
      }
    ],
    "sessionUpdated": {
      "score": 16.5,
      "percentage": 82.5,
      "status": "IN_PROGRESS"
    }
  }
}
```

#### Update Single Answer
```http
PUT /quiz-sessions/{sessionId}/questions/{questionId}/answer
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Update a previously submitted answer for a specific question.

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `sessionId`: Positive integer (required)
- `questionId`: Positive integer (required)

**Request Body:**
```json
{
  "selectedAnswerId": 3
}
```

**Validation Rules:**
- `selectedAnswerId`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "questionId": 2,
    "isCorrect": true,
    "score": 1.0,
    "explanation": "Correct! This is the right answer.",
    "sessionUpdated": {
      "score": 17.5,
      "percentage": 87.5
    }
  }
}
```

### Retake Sessions

#### Create Retake Session
```http
POST /quiz-sessions/retake
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create a retake session based on a previous quiz session with different filtering options.

**Authentication:** Required (Student role + active subscription)

**Request Body:**
```json
{
  "originalSessionId": 123,
  "retakeType": "INCORRECT_ONLY",
  "title": "Anatomy Quiz - Incorrect Questions Only"
}
```

**Validation Rules:**
- `originalSessionId`: Positive integer (required)
- `retakeType`: Enum value (required)
  - `SAME`: Exact same questions
  - `INCORRECT_ONLY`: Only previously incorrect answers
  - `CORRECT_ONLY`: Only previously correct answers
  - `NOT_RESPONDED`: Only skipped/unanswered questions
- `title`: 3-100 characters, alphanumeric with basic punctuation (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 124,
      "title": "Anatomy Quiz - Incorrect Questions Only",
      "originalSessionId": 123,
      "retakeType": "INCORRECT_ONLY",
      "status": "NOT_STARTED",
      "questionCount": 5,
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "questions": [
      {
        "id": 2,
        "questionText": "What is the largest organ in the human body?",
        "questionType": "SINGLE_CHOICE",
        "answers": [
          {
            "id": 5,
            "answerText": "Liver"
          },
          {
            "id": 6,
            "answerText": "Skin"
          },
          {
            "id": 7,
            "answerText": "Brain"
          },
          {
            "id": 8,
            "answerText": "Heart"
          }
        ]
      }
    ]
  }
}
```
    "yearLevels": ["ONE", "TWO", "THREE", "FOUR", "FIVE"],
    "unites": [
      {
        "id": 1,
        "name": "Anatomy",
        "modules": [
          {
            "id": 1,
            "name": "Cardiovascular System",
            "courses": [
              {
                "id": 1,
                "name": "Heart Anatomy"
              }
            ]
          }
        ]
      }
    ],
    "quizSources": [
      {
        "id": 1,
        "name": "University Exams"
      },
      {
        "id": 2,
        "name": "Practice Questions"
      }
    ]
  }
}
```

### Get User Quiz Sessions

Get paginated list of user's quiz sessions with filtering options.

```http
GET /students/quiz-sessions?page=1&limit=10&status=COMPLETED
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by session status (NOT_STARTED, IN_PROGRESS, COMPLETED)
- `type`: Filter by session type (PRACTICE, EXAM, REMEDIAL)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 123,
        "title": "Anatomy Practice Quiz",
        "type": "PRACTICE",
        "quizType": "QCM",
        "status": "COMPLETED",
        "score": 18.5,
        "percentage": 92.5,
        "totalQuestions": 20,
        "startedAt": "2024-01-01T10:00:00.000Z",
        "completedAt": "2024-01-01T10:30:00.000Z",
        "isRetake": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Quiz Session Validation Rules

#### Create Quiz Session Validation
- **title**: 3-100 characters, alphanumeric with basic punctuation
- **type**: Valid SessionType enum (PRACTICE, EXAM, REMEDIAL)
- **quizType**: Optional QuizType enum (QCM, QCS, PRACTICE, EXAM, MOCK)
- **settings.questionCount**: 1-100 questions
- **filters**: At least one filter must be provided
  - **yearLevels**: Array of valid YearLevel enums
  - **uniteIds**: Array of positive integers (max 50)
  - **moduleIds**: Array of positive integers (max 50)
  - **courseIds**: Array of positive integers (max 50)

#### Submit Answers Validation
- **answers**: Array of 1-100 answer objects
- Each answer must have either:
  - **selectedAnswerId**: For single choice questions
  - **selectedAnswerIds**: Array of IDs for multiple choice questions
- Cannot have both selectedAnswerId and selectedAnswerIds

### Quiz Types and Question Types

#### Quiz Types (quizType)
- **QCM**: Questions à Choix Multiples (Multiple Choice Questions)
- **QCS**: Questions à Choix Simple (Single Choice Questions)
- **PRACTICE**: General practice sessions
- **EXAM**: Formal examination sessions
- **MOCK**: Mock examination sessions

#### Question Types (questionType)
- **SINGLE_CHOICE**: Only one correct answer allowed
- **MULTIPLE_CHOICE**: Multiple correct answers allowed

### Advanced Quiz Features

#### Quiz Sources and Years
Quiz sessions can be filtered by source and year for better organization:

```http
POST /quizzes/quiz-sessions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "2024 University Exam Practice",
  "type": "PRACTICE",
  "quizType": "QCM",
  "settings": {
    "questionCount": 30
  },
  "filters": {
    "yearLevels": ["FOUR"],
    "quizSourceIds": [1],
    "quizYears": [2024, 2023]
  }
}
```

#### Retake Session Options

The retake system provides flexible options for reviewing and improving performance:

1. **SAME**: Exact replay of the original session
   - Same questions in same order
   - Useful for memory reinforcement

2. **INCORRECT_ONLY**: Focus on mistakes
   - Only questions answered incorrectly
   - Efficient targeted practice

3. **CORRECT_ONLY**: Reinforce strengths
   - Only questions answered correctly
   - Confidence building

4. **NOT_RESPONDED**: Complete unfinished work
   - Only skipped or unanswered questions
   - Finish incomplete sessions

## Exam System

The exam system provides structured exam sessions based on predefined exams and modules. All exam endpoints require authentication and active subscription.

### Exam Session Creation

#### Create Exam Session
```http
POST /exams/exam-sessions
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create an exam session from a specific predefined exam.

**Authentication:** Required (Student role + active subscription)

**Request Body:**
```json
{
  "examId": 16
}
```

**Validation Rules:**
- `examId`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 456,
      "title": "Anatomy Final Exam 2024",
      "type": "EXAM",
      "status": "NOT_STARTED",
      "examId": 16,
      "questionCount": 50,
      "timeLimit": 120,
      "createdAt": "2024-01-01T14:00:00.000Z"
    },
    "questions": [
      {
        "id": 10,
        "questionText": "What is the primary function of the respiratory system?",
        "questionType": "SINGLE_CHOICE",
        "orderInExam": 1,
        "answers": [
          {
            "id": 40,
            "answerText": "Gas exchange"
          },
          {
            "id": 41,
            "answerText": "Blood circulation"
          },
          {
            "id": 42,
            "answerText": "Digestion"
          },
          {
            "id": 43,
            "answerText": "Waste elimination"
          }
        ]
      }
    ]
  }
}
```

#### Create Exam Session from Multiple Modules
```http
POST /exams/exam-sessions/from-modules
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create an exam session combining questions from multiple modules for a specific year.

**Authentication:** Required (Student role + active subscription)

**Request Body:**
```json
{
  "moduleIds": [21, 22, 23],
  "year": 2024,
  "title": "Combined Modules Practice Exam"
}
```

**Validation Rules:**
- `moduleIds`: Array of positive integers (required)
- `year`: Integer (required)
- `title`: String (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 457,
      "title": "Combined Modules Practice Exam",
      "type": "EXAM",
      "status": "NOT_STARTED",
      "moduleIds": [21, 22, 23],
      "year": 2024,
      "questionCount": 75,
      "createdAt": "2024-01-01T14:00:00.000Z"
    },
    "questions": [
      {
        "id": 11,
        "questionText": "Which hormone regulates blood sugar levels?",
        "questionType": "SINGLE_CHOICE",
        "moduleId": 21,
        "answers": [
          {
            "id": 44,
            "answerText": "Insulin"
          },
          {
            "id": 45,
            "answerText": "Adrenaline"
          },
          {
            "id": 46,
            "answerText": "Cortisol"
          },
          {
            "id": 47,
            "answerText": "Thyroxine"
          }
        ]
      }
    ]
  }
}
```

### Exam Discovery and Selection

#### Get Available Exams
```http
GET /exams/available
Authorization: Bearer <access_token>
```

**Description:** Get list of available exams for the authenticated user.

**Authentication:** Required (Student role + active subscription)

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": 16,
        "title": "Anatomy Final Exam 2024",
        "description": "Comprehensive anatomy examination covering all major systems",
        "moduleId": 5,
        "moduleName": "Human Anatomy",
        "universityId": 1,
        "universityName": "University of Algiers",
        "yearLevel": "THREE",
        "examYear": "2024-01-15",
        "year": 2024,
        "questionCount": 50,
        "timeLimit": 120,
        "difficulty": "INTERMEDIATE"
      }
    ]
  }
}
```

#### Get Exams by Module and Year
```http
GET /exams/by-module/{moduleId}/{year}
Authorization: Bearer <access_token>
```

**Description:** Get exams for a specific module and year.

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `moduleId`: Positive integer (required)
- `year`: Year (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": 17,
        "title": "Physiology Midterm 2024",
        "moduleId": 6,
        "year": 2024,
        "questionCount": 30,
        "timeLimit": 90
      }
    ]
  }
}
```

#### Get Exam Details
```http
GET /exams/{examId}
Authorization: Bearer <access_token>
```

**Description:** Get detailed information about a specific exam.

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `examId`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 16,
    "title": "Anatomy Final Exam 2024",
    "description": "Comprehensive anatomy examination covering all major systems",
    "moduleId": 5,
    "moduleName": "Human Anatomy",
    "universityId": 1,
    "universityName": "University of Algiers",
    "yearLevel": "THREE",
    "examYear": "2024-01-15",
    "year": 2024,
    "questionCount": 50,
    "timeLimit": 120,
    "difficulty": "INTERMEDIATE",
    "topics": [
      "Cardiovascular System",
      "Respiratory System",
      "Nervous System",
      "Musculoskeletal System"
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Exam Questions
```http
GET /exams/{examId}/questions
Authorization: Bearer <access_token>
```

**Description:** Get all questions for a specific exam (preview mode).

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `examId`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "examId": 16,
    "title": "Anatomy Final Exam 2024",
    "questionCount": 50,
    "questions": [
      {
        "id": 10,
        "questionText": "What is the primary function of the respiratory system?",
        "questionType": "SINGLE_CHOICE",
        "orderInExam": 1,
        "explanation": "The respiratory system's main function is gas exchange - taking in oxygen and removing carbon dioxide.",
        "answers": [
          {
            "id": 40,
            "answerText": "Gas exchange",
            "isCorrect": true
          },
          {
            "id": 41,
            "answerText": "Blood circulation",
            "isCorrect": false
          },
          {
            "id": 42,
            "answerText": "Digestion",
            "isCorrect": false
          },
          {
            "id": 43,
            "answerText": "Waste elimination",
            "isCorrect": false
          }
        ]
      }
    ]
  }
}
```
          {
            "id": 40,
            "answerText": "Gas exchange"
          },
          {
            "id": 41,
            "answerText": "Blood circulation"
          }
        ]
      }
    ],
    "totalQuestions": 50
  }
}
```

### Get Available Exams

Get list of available exams for the authenticated user.

```http
GET /exams/available
Authorization: Bearer <access_token>
```

### Get Exam Details

Get detailed information about a specific exam.

```http
GET /exams/{examId}
Authorization: Bearer <access_token>
```

### Get Exam Questions

Get questions for a specific exam with proper ordering.

```http
GET /exams/{examId}/questions
Authorization: Bearer <access_token>
```

### Get Exams by Module and Year

Get exams filtered by module and year.

```http
GET /exams/by-module/{moduleId}/{year}
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": 16,
        "title": "Cardiovascular System Final Exam",
        "description": "Comprehensive exam covering all cardiovascular topics",
        "moduleId": 21,
        "universityId": 24,
        "yearLevel": "THREE",
        "year": 2024,
        "examYear": "2024-01-01T00:00:00.000Z",
        "questionCount": 50,
        "module": {
          "id": 21,
          "name": "Cardiovascular System",
          "unite": {
            "id": 1,
            "name": "Anatomy"
          }
        }
      }
    ]
  }
}
```

### Exam Session Management

#### Submit Exam Answers

Exam sessions use the same answer submission format as quiz sessions:

```http
POST /quiz-sessions/{examSessionId}/submit-answer
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 15,
      "selectedAnswerId": 60
    },
    {
      "questionId": 16,
      "selectedAnswerIds": [64, 65, 67]
    }
  ]
}
```

#### Get Exam Session Results

```http
GET /quiz-sessions/{examSessionId}
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "title": "Cardiovascular System Final Exam",
    "type": "EXAM",
    "status": "COMPLETED",
    "score": 42.5,
    "percentage": 85.0,
    "totalQuestions": 50,
    "startedAt": "2024-01-01T14:00:00.000Z",
    "completedAt": "2024-01-01T16:30:00.000Z",
    "exam": {
      "id": 16,
      "title": "Cardiovascular System Final Exam",
      "module": {
        "name": "Cardiovascular System"
      }
    },
    "questions": [
      {
        "id": 15,
        "questionText": "What is the normal heart rate range for adults?",
        "questionType": "SINGLE_CHOICE",
        "orderInExam": 1,
        "userAnswer": {
          "selectedAnswerId": 60,
          "isCorrect": true,
          "answeredAt": "2024-01-01T14:05:00.000Z"
        },
        "answers": [
          {
            "id": 60,
            "answerText": "60-100 bpm",
            "isCorrect": true,
            "explanation": "Normal resting heart rate for adults is 60-100 beats per minute."
          }
        ]
      }
    ]
  }
}
```

### Exam Validation Rules

#### Create Exam Session Validation
- **examId**: Required positive integer
- Must be a valid, accessible exam for the user

#### Create Exam Session from Modules Validation
- **moduleIds**: Array of positive integers (1-10 modules)
- **year**: 4-digit year (1900 to current year + 10)
- All modules must be accessible to the user

### Exam Features

#### Question Ordering
Exams support manual question ordering through the `orderInExam` field:
- Questions are displayed in the specified order
- Unordered questions appear after ordered ones
- Maintains consistent exam structure

#### Module-Based Exam Creation
Create comprehensive exams by combining multiple modules:
- Automatically includes all questions from selected modules
- Filters by year for relevant content
- Maintains question diversity across topics

#### Exam vs Quiz Differences

| Feature | Quiz Sessions | Exam Sessions |
|---------|---------------|---------------|
| **Creation** | Dynamic filtering | Predefined structure |
| **Question Selection** | Flexible criteria | Module/exam based |
| **Question Order** | Random/creation order | Manual ordering supported |
| **Time Limits** | Optional | Often enforced |
| **Retakes** | Flexible options | May be restricted |
| **Scoring** | Practice focused | Formal assessment |

## Student Management

Student-specific endpoints for progress tracking, analytics, and personal management. All student endpoints require authentication and student role.

### Progress and Analytics

#### Get Progress Overview
```http
GET /students/progress/overview
Authorization: Bearer <access_token>
```

**Description:** Get comprehensive progress summary for the authenticated student.

**Authentication:** Required (Student role + active subscription)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 45,
    "completedSessions": 38,
    "averageScore": 78.5,
    "totalTimeSpent": "24h 30m",
    "currentStreak": 7,
    "longestStreak": 15,
    "recentActivity": [
      {
        "sessionId": 123,
        "title": "Anatomy Quiz",
        "type": "PRACTICE",
        "score": 85,
        "percentage": 85.0,
        "completedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "progressBySubject": [
      {
        "subjectName": "Anatomy",
        "totalSessions": 15,
        "averageScore": 82.3,
        "improvement": 12.5
      }
    ],
    "weeklyProgress": [
      {
        "week": "2024-W01",
        "sessionsCompleted": 5,
        "averageScore": 78.2,
        "timeSpent": "3h 45m"
      }
    ]
  }
}
```

#### Update Course Progress
```http
PUT /students/courses/{courseId}/progress
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Update progress tracking for a specific course.

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `courseId`: Positive integer (required)

**Request Body:**
```json
{
  "progressPercentage": 75.5,
  "lastAccessedAt": "2024-01-01T10:00:00.000Z",
  "notes": "Completed chapter 5"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": 1,
    "progressPercentage": 75.5,
    "lastAccessedAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

#### Get Quiz History
```http
GET /students/quiz-history
Authorization: Bearer <access_token>
```

**Description:** Get paginated history of completed quizzes and exams.

**Authentication:** Required (Student role + active subscription)

**Query Parameters:**
- `type`: Session type filter (PRACTICE, EXAM) (optional)
- `page`: Page number (1-1000, default: 1)
- `limit`: Items per page (1-50, default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 123,
        "title": "Anatomy Practice Quiz",
        "type": "PRACTICE",
        "status": "COMPLETED",
        "score": 18.5,
        "percentage": 92.5,
        "questionCount": 20,
        "timeSpent": "15m 30s",
        "completedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Session Results with Filtering
```http
GET /students/session-results
Authorization: Bearer <access_token>
```

**Description:** Get detailed session results with advanced filtering options.

**Authentication:** Required (Student role + active subscription)

**Query Parameters:**
- `answerType`: Filter by answer correctness (correct, incorrect, all) (default: all)
- `sessionType`: Filter by session type (PRACTICE, EXAM) (optional)
- `sessionIds`: Comma-separated list of session IDs (optional, max 50)
- `examId`: Filter by specific exam ID (optional)
- `quizId`: Filter by specific quiz ID (optional)
- `completedAfter`: ISO datetime filter (optional)
- `completedBefore`: ISO datetime filter (optional)
- `page`: Page number (1-1000, default: 1)
- `limit`: Items per page (1-100, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "sessionId": 123,
        "questionId": 1,
        "questionText": "What is the largest organ in the human body?",
        "userAnswer": "Skin",
        "correctAnswer": "Skin",
        "isCorrect": true,
        "timeSpent": "30s",
        "answeredAt": "2024-01-01T10:05:00.000Z"
      }
    ],
    "summary": {
      "totalQuestions": 100,
      "correctAnswers": 85,
      "incorrectAnswers": 15,
      "accuracy": 85.0
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Available Sessions
```http
GET /students/available-sessions
Authorization: Bearer <access_token>
```

**Description:** Get available quiz and exam sessions for the student.

**Authentication:** Required (Student role + active subscription)

**Query Parameters:**
- `sessionType`: Filter by session type (PRACTICE, EXAM) (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "availableSessions": [
      {
        "type": "PRACTICE",
        "title": "Anatomy Practice",
        "description": "Practice questions for anatomy",
        "estimatedQuestions": 20,
        "difficulty": "INTERMEDIATE"
      },
      {
        "type": "EXAM",
        "title": "Midterm Exam",
        "description": "Comprehensive midterm examination",
        "estimatedQuestions": 50,
        "timeLimit": 120,
        "difficulty": "ADVANCED"
      }
    ]
  }
}
```

### Subscription Management

#### Get User Subscriptions
```http
GET /students/subscriptions
Authorization: Bearer <access_token>
```

**Description:** Get current subscription information for the authenticated student.

**Authentication:** Required (Student role)

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "studyPackId": 1,
        "studyPackName": "Medical Year 3 Complete",
        "status": "ACTIVE",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.000Z",
        "daysRemaining": 300,
        "amountPaid": 299.99,
        "paymentMethod": "credit_card",
        "paymentReference": "PAY_123456789"
      }
    ],
    "paymentStatus": "active",
    "hasActiveSubscription": true
  }
}
```

### Notes Management

#### Get Student Notes
```http
GET /students/notes
Authorization: Bearer <access_token>
```

**Description:** Get student's personal notes with optional filtering.

**Authentication:** Required (Student role)

**Query Parameters:**
- `questionId`: Filter by specific question ID (optional)
- `quizId`: Filter by specific quiz ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": 1,
        "noteText": "Remember: Heart has 4 chambers",
        "questionId": 10,
        "quizId": 5,
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### Create Student Note
```http
POST /students/notes
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create a new personal note.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "noteText": "Important concept to review",
  "questionId": 10,
  "quizId": 5
}
```

**Validation Rules:**
- `noteText`: 1-2000 characters (required)
- `questionId`: Positive integer (optional)
- `quizId`: Positive integer (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": 2,
      "noteText": "Important concept to review",
      "questionId": 10,
      "quizId": 5,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

#### Update Student Note
```http
PUT /students/notes/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Update an existing note.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Request Body:**
```json
{
  "noteText": "Updated note content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "note": {
      "id": 2,
      "noteText": "Updated note content",
      "updatedAt": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

#### Delete Student Note
```http
DELETE /students/notes/{id}
Authorization: Bearer <access_token>
```

**Description:** Delete a note.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

#### Get Notes for Question
```http
GET /students/questions/{id}/notes
Authorization: Bearer <access_token>
```

**Description:** Get all notes associated with a specific question.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "questionId": 10,
    "notes": [
      {
        "id": 1,
        "noteText": "Key concept for exam",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Labels Management

#### Get Student Labels
```http
GET /students/labels
Authorization: Bearer <access_token>
```

**Description:** Get all labels created by the student for organizing content.

**Authentication:** Required (Student role)

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": [
      {
        "id": 1,
        "name": "Important",
        "color": "#ff0000",
        "createdAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Review Later",
        "color": "#00ff00",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### Create Student Label
```http
POST /students/labels
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create a new label for organizing content.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "name": "Difficult Topics"
}
```

**Validation Rules:**
- `name`: 1-50 characters, alphanumeric with spaces, hyphens, underscores (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "label": {
      "id": 3,
      "name": "Difficult Topics",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

#### Update Student Label
```http
PUT /students/labels/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Update an existing label.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Request Body:**
```json
{
  "name": "Updated Label Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "label": {
      "id": 3,
      "name": "Updated Label Name",
      "updatedAt": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

#### Delete Student Label
```http
DELETE /students/labels/{id}
Authorization: Bearer <access_token>
```

**Description:** Delete a label.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "message": "Label deleted successfully"
}
```

#### Add Label to Quiz
```http
POST /students/quizzes/{quizId}/labels/{labelId}
Authorization: Bearer <access_token>
```

**Description:** Associate a label with a quiz.

**Authentication:** Required (Student role)

**Path Parameters:**
- `quizId`: Positive integer (required)
- `labelId`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "message": "Label added to quiz successfully"
}
```

#### Add Label to Quiz Session
```http
POST /students/quiz-sessions/{quizSessionId}/labels/{labelId}
Authorization: Bearer <access_token>
```

**Description:** Associate a label with a quiz session.

**Authentication:** Required (Student role)

**Path Parameters:**
- `quizSessionId`: Positive integer (required)
- `labelId`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "message": "Label added to quiz session successfully"
}
```

### Todo Management

#### Get Todos
```http
GET /students/todos
Authorization: Bearer <access_token>
```

**Description:** Get student's todo items with filtering and pagination.

**Authentication:** Required (Student role)

**Query Parameters:**
- `status`: Filter by status (PENDING, COMPLETED, CANCELLED) (optional)
- `type`: Filter by type (STUDY, REVIEW, PRACTICE, OTHER) (optional)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH, URGENT) (optional)
- `page`: Page number (1-1000, default: 1)
- `limit`: Items per page (1-100, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": 1,
        "title": "Review cardiovascular system",
        "description": "Focus on heart anatomy and blood circulation",
        "type": "REVIEW",
        "priority": "HIGH",
        "status": "PENDING",
        "dueDate": "2024-01-15T00:00:00.000Z",
        "courseId": 5,
        "courseName": "Human Anatomy",
        "createdAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### Create Todo
```http
POST /students/todos
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Create a new todo item.

**Authentication:** Required (Student role)

**Request Body:**
```json
{
  "title": "Study respiratory system",
  "description": "Prepare for upcoming quiz",
  "type": "STUDY",
  "priority": "MEDIUM",
  "dueDate": "2024-01-20T00:00:00.000Z",
  "courseId": 6
}
```

**Validation Rules:**
- `title`: 1-100 characters (required)
- `description`: Max 500 characters (optional)
- `type`: Enum value (STUDY, REVIEW, PRACTICE, OTHER) (optional)
- `priority`: Enum value (LOW, MEDIUM, HIGH, URGENT) (optional)
- `dueDate`: ISO datetime (optional)
- `courseId`: Positive integer (optional)
- `quizId`: Positive integer (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": 2,
      "title": "Study respiratory system",
      "description": "Prepare for upcoming quiz",
      "type": "STUDY",
      "priority": "MEDIUM",
      "status": "PENDING",
      "dueDate": "2024-01-20T00:00:00.000Z",
      "courseId": 6,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

#### Update Todo
```http
PUT /students/todos/{id}
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Update an existing todo item.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Request Body:**
```json
{
  "title": "Updated todo title",
  "priority": "HIGH",
  "status": "COMPLETED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": 2,
      "title": "Updated todo title",
      "priority": "HIGH",
      "status": "COMPLETED",
      "updatedAt": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

#### Delete Todo
```http
DELETE /students/todos/{id}
Authorization: Bearer <access_token>
```

**Description:** Delete a todo item.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

#### Complete Todo
```http
PUT /students/todos/{id}/complete
Authorization: Bearer <access_token>
```

**Description:** Mark a todo item as completed.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": 2,
      "status": "COMPLETED",
      "completedAt": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

### Question Reporting

#### Report Question Issue
```http
POST /students/questions/{id}/report
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Description:** Report an issue with a question for quality control.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Request Body:**
```json
{
  "reportType": "INCORRECT_ANSWER",
  "description": "The marked correct answer seems to be wrong based on my textbook"
}
```

**Validation Rules:**
- `reportType`: Enum value (INCORRECT_ANSWER, UNCLEAR_QUESTION, TECHNICAL_ERROR, CONTENT_ERROR, OTHER) (required)
- `description`: 10-1000 characters (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": 1,
      "questionId": 10,
      "reportType": "INCORRECT_ANSWER",
      "description": "The marked correct answer seems to be wrong based on my textbook",
      "status": "PENDING",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

#### Get User Reports
```http
GET /students/reports
Authorization: Bearer <access_token>
```

**Description:** Get all question reports submitted by the student.

**Authentication:** Required (Student role)

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "questionId": 10,
        "reportType": "INCORRECT_ANSWER",
        "status": "PENDING",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "adminResponse": null
      }
    ]
  }
}
```

#### Get Report Details
```http
GET /students/reports/{id}
Authorization: Bearer <access_token>
```

**Description:** Get detailed information about a specific report.

**Authentication:** Required (Student role)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": 1,
      "questionId": 10,
      "reportType": "INCORRECT_ANSWER",
      "description": "The marked correct answer seems to be wrong",
      "status": "RESOLVED",
      "adminResponse": "Thank you for the report. The question has been reviewed and corrected.",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "resolvedAt": "2024-01-02T09:00:00.000Z"
    }
  }
}
```

### Performance Analytics

#### Get Detailed Performance Analytics
```http
GET /students/dashboard/performance
Authorization: Bearer <access_token>
```

**Description:** Get comprehensive performance analytics and insights.

**Authentication:** Required (Student role)

**Response:**
```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalSessions": 45,
      "averageScore": 78.5,
      "totalTimeSpent": "24h 30m",
      "improvementRate": 12.3
    },
    "subjectPerformance": [
      {
        "subject": "Anatomy",
        "averageScore": 82.1,
        "sessionsCompleted": 15,
        "timeSpent": "8h 15m",
        "strongAreas": ["Cardiovascular System", "Respiratory System"],
        "weakAreas": ["Nervous System"]
      }
    ],
    "progressTrend": [
      {
        "date": "2024-01-01",
        "averageScore": 75.2,
        "sessionsCompleted": 3
      }
    ],
    "recommendations": [
      {
        "type": "FOCUS_AREA",
        "message": "Consider spending more time on Nervous System topics",
        "priority": "HIGH"
      }
    ]
  }
}
```

#### Get Session Statistics
```http
GET /students/session-stats
Authorization: Bearer <access_token>
```

**Description:** Get statistical analysis of quiz and exam sessions.

**Authentication:** Required (Student role + active subscription)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionStats": {
      "totalSessions": 45,
      "practiceSessions": 35,
      "examSessions": 10,
      "averageSessionDuration": "18m 30s",
      "completionRate": 94.2
    },
    "scoreDistribution": {
      "excellent": 15,
      "good": 20,
      "average": 8,
      "needsImprovement": 2
    },
    "timeAnalysis": {
      "averageTimePerQuestion": "45s",
      "fastestSession": "12m 15s",
      "slowestSession": "35m 20s"
    }
  }
}
```

### Content Access

#### Get Study Packs
```http
GET /study-packs
Authorization: Bearer <access_token>
```

**Description:** Get available study packs (public access, but enhanced with auth).

**Authentication:** Optional (enhanced data with authentication)

**Response:**
```json
{
  "success": true,
  "data": {
    "studyPacks": [
      {
        "id": 1,
        "name": "Medical Year 3 Complete",
        "description": "Comprehensive study pack for third-year medical students",
        "type": "YEARLY",
        "yearNumber": "THREE",
        "price": 299.99,
        "isActive": true,
        "features": [
          "1000+ Practice Questions",
          "50+ Mock Exams",
          "Detailed Explanations",
          "Progress Tracking"
        ],
        "userHasAccess": true
      }
    ]
  }
}
```

#### Get Study Pack Details
```http
GET /study-packs/{id}
Authorization: Bearer <access_token>
```

**Description:** Get detailed information about a specific study pack.

**Authentication:** Optional (enhanced data with authentication)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "studyPack": {
      "id": 1,
      "name": "Medical Year 3 Complete",
      "description": "Comprehensive study pack for third-year medical students",
      "type": "YEARLY",
      "yearNumber": "THREE",
      "price": 299.99,
      "isActive": true,
      "totalQuestions": 1250,
      "totalExams": 45,
      "unites": [
        {
          "id": 1,
          "name": "Basic Sciences",
          "modules": [
            {
              "id": 1,
              "name": "Anatomy",
              "questionCount": 300
            }
          ]
        }
      ],
      "userHasAccess": true,
      "userProgress": {
        "completedQuestions": 450,
        "completedExams": 12,
        "progressPercentage": 36.0
      }
    }
  }
}
```

#### Get Course Resources
```http
GET /courses/{id}/resources
Authorization: Bearer <access_token>
```

**Description:** Get educational resources for a specific course.

**Authentication:** Required (Student role + active subscription)

**Path Parameters:**
- `id`: Positive integer (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": 1,
    "courseName": "Human Anatomy",
    "resources": [
      {
        "id": 1,
        "type": "PDF",
        "title": "Anatomy Textbook Chapter 1",
        "description": "Introduction to human anatomy",
        "filePath": "/media/pdfs/anatomy-ch1.pdf",
        "isPaid": false,
        "downloadCount": 1250
      },
      {
        "id": 2,
        "type": "VIDEO",
        "title": "Heart Anatomy Explained",
        "description": "Detailed explanation of heart structure",
        "youtubeVideoId": "dQw4w9WgXcQ",
        "isPaid": true,
        "price": 9.99
      }
    ]
  }
}
```
        "studyPack": {
          "id": 1,
          "name": "Third Year Medical Studies",
          "type": "YEAR",
          "yearNumber": "THREE",
          "price": 299.99
        }
      }
    ]
  }
}
```

### Student Notes Management

#### Get Student Notes

Get notes created by the student, optionally filtered by question or quiz.

```http
GET /students/notes?questionId=123&page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `questionId`: Filter notes for specific question
- `quizId`: Filter notes for specific quiz
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": 1,
        "noteText": "Remember: Heart has 4 chambers - 2 atria, 2 ventricles",
        "questionId": 123,
        "quizId": null,
        "createdAt": "2024-01-01T10:30:00.000Z",
        "updatedAt": "2024-01-01T10:30:00.000Z",
        "question": {
          "id": 123,
          "questionText": "How many chambers does the human heart have?"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Create Student Note

```http
POST /students/notes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "noteText": "Important concept to review before exam",
  "questionId": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "noteText": "Important concept to review before exam",
    "questionId": 123,
    "quizId": null,
    "createdAt": "2024-01-01T11:00:00.000Z"
  }
}
```

#### Update Student Note

```http
PUT /students/notes/{noteId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "noteText": "Updated note content with additional details"
}
```

#### Delete Student Note

```http
DELETE /students/notes/{noteId}
Authorization: Bearer <access_token>
```

### Student Labels Management

#### Get Student Labels

Get custom labels created by the student.

```http
GET /students/labels
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": [
      {
        "id": 1,
        "name": "Difficult Topics",
        "createdAt": "2024-01-01T09:00:00.000Z",
        "usageCount": 15
      },
      {
        "id": 2,
        "name": "Review Later",
        "createdAt": "2024-01-01T09:30:00.000Z",
        "usageCount": 8
      }
    ]
  }
}
```

#### Create Student Label

```http
POST /students/labels
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Exam Prep"
}
```

#### Apply Label to Quiz

```http
POST /students/quizzes/{quizId}/labels
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "labelId": 1
}
```

#### Apply Label to Question

```http
POST /students/questions/{questionId}/labels
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "labelId": 1
}
```

#### Apply Label to Quiz Session

```http
POST /students/quiz-sessions/{sessionId}/labels
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "labelId": 1
}
```

### Todo Management

#### Get Todos

Get student's todo items with filtering options.

```http
GET /students/todos?status=PENDING&priority=HIGH&page=1&limit=10
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by status (PENDING, IN_PROGRESS, COMPLETED)
- `type`: Filter by type (READING, QUIZ, SESSION, EXAM, OTHER)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": 1,
        "title": "Review Cardiovascular System",
        "description": "Study heart anatomy and physiology before exam",
        "type": "READING",
        "priority": "HIGH",
        "status": "PENDING",
        "dueDate": "2024-01-15T23:59:59.000Z",
        "courseId": 10,
        "course": {
          "name": "Heart Anatomy"
        },
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5
    }
  }
}
```

#### Create Todo

```http
POST /students/todos
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Complete Anatomy Quiz",
  "description": "Finish the cardiovascular system practice quiz",
  "type": "QUIZ",
  "priority": "MEDIUM",
  "dueDate": "2024-01-10T18:00:00.000Z",
  "quizId": 15
}
```

#### Update Todo

```http
PUT /students/todos/{todoId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "priority": "LOW"
}
```

#### Delete Todo

```http
DELETE /students/todos/{todoId}
Authorization: Bearer <access_token>
```

### Question Reports

#### Get User Reports

Get reports submitted by the student.

```http
GET /students/reports?status=PENDING&page=1&limit=10
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "reportType": "INCORRECT_ANSWER",
        "description": "The correct answer seems to be wrong based on my textbook",
        "status": "PENDING",
        "questionId": 123,
        "question": {
          "questionText": "What is the normal heart rate?"
        },
        "createdAt": "2024-01-01T15:00:00.000Z"
      }
    ]
  }
}
```

#### Create Question Report

```http
POST /students/questions/{questionId}/reports
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reportType": "INCORRECT_ANSWER",
  "description": "The explanation doesn't match the correct answer provided"
}
```

**Report Types:**
- `INCORRECT_ANSWER`: Question has wrong answer marked as correct
- `UNCLEAR_QUESTION`: Question text is confusing or ambiguous
- `TYPO`: Spelling or grammar errors
- `INAPPROPRIATE`: Inappropriate content
- `OTHER`: Other issues

### Advanced Analytics

#### Get Detailed Performance Analytics

```http
GET /students/performance/detailed?timeframe=30d&subject=anatomy
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `timeframe`: Time period (7d, 30d, 90d, 1y)
- `subject`: Filter by subject/course
- `questionType`: Filter by question type (SINGLE_CHOICE, MULTIPLE_CHOICE)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSessions": 25,
      "averageScore": 78.5,
      "improvementRate": 12.3,
      "timeSpent": "15h 30m"
    },
    "performanceByDay": [
      {
        "date": "2024-01-01",
        "sessionsCompleted": 3,
        "averageScore": 82.1,
        "timeSpent": "2h 15m"
      }
    ],
    "performanceBySubject": [
      {
        "subject": "Anatomy",
        "sessionsCompleted": 15,
        "averageScore": 85.2,
        "strongTopics": ["Heart", "Lungs"],
        "weakTopics": ["Kidneys", "Liver"]
      }
    ],
    "questionTypePerformance": {
      "SINGLE_CHOICE": {
        "accuracy": 82.5,
        "averageTime": "45s"
      },
      "MULTIPLE_CHOICE": {
        "accuracy": 74.2,
        "averageTime": "1m 20s"
      }
    }
  }
}
```

### Session Results and History

#### Get Session Results with Filtering

```http
GET /students/session-results?answerType=incorrect&sessionType=PRACTICE&page=1&limit=20
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `answerType`: Filter by answer correctness (correct, incorrect, all)
- `sessionType`: Filter by session type (PRACTICE, EXAM)
- `completedAfter`: Filter sessions completed after date
- `completedBefore`: Filter sessions completed before date
- `examId`: Filter by specific exam
- `quizId`: Filter by specific quiz

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "sessionId": 123,
        "questionId": 456,
        "questionText": "What is the function of the heart?",
        "userAnswer": "Filtering blood",
        "correctAnswer": "Pumping blood",
        "isCorrect": false,
        "explanation": "The heart's primary function is to pump blood throughout the body",
        "answeredAt": "2024-01-01T10:15:00.000Z",
        "session": {
          "title": "Cardiovascular Quiz",
          "type": "PRACTICE"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45
    }
  }
}
```

## Admin & Content Management

Administrative endpoints for content creation, user management, and system administration. These endpoints require ADMIN or EMPLOYEE role permissions.

### Dashboard & Analytics

#### Get Dashboard Stats (Admin Only)

```http
GET /admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "students": 1180,
      "employees": 65,
      "admins": 5,
      "newThisMonth": 45
    },
    "content": {
      "totalQuizzes": 350,
      "totalExams": 125,
      "totalQuestions": 8500,
      "totalSessions": 15600
    },
    "activity": {
      "activeUsers": 890,
      "sessionsToday": 245,
      "averageSessionScore": 76.8
    },
    "subscriptions": {
      "active": 980,
      "expired": 200,
      "revenue": 125000.50
    }
  }
}
```

### User Management

#### Get All Users (Admin Only)

```http
GET /admin/users?page=1&limit=20&role=STUDENT&search=john
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `role`: Filter by user role (STUDENT, EMPLOYEE, ADMIN)
- `search`: Search by name or email
- `university`: Filter by university ID
- `isActive`: Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "john.doe@example.com",
        "fullName": "John Doe",
        "role": "STUDENT",
        "universityId": 1,
        "university": {
          "name": "University of Algiers"
        },
        "currentYear": "THREE",
        "isActive": true,
        "emailVerified": true,
        "lastLogin": "2024-01-01T10:00:00.000Z",
        "createdAt": "2023-09-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1250,
      "totalPages": 63
    }
  }
}
```

#### Create User (Admin Only)

```http
POST /admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "New User",
  "role": "STUDENT",
  "universityId": 1,
  "specialtyId": 2,
  "currentYear": "TWO"
}
```

#### Update User (Admin Only)

```http
PUT /admin/users/{userId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "fullName": "Updated Name",
  "role": "EMPLOYEE",
  "isActive": false
}
```

#### Reset User Password (Admin Only)

```http
POST /admin/users/{userId}/reset-password
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

### Content Structure Management

#### Universities

##### Get All Universities

```http
GET /universities
```

##### Create University (Admin Only)

```http
POST /admin/universities
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "University of Constantine",
  "country": "Algeria"
}
```

#### Specialties

##### Get All Specialties

```http
GET /specialties
```

##### Create Specialty (Admin Only)

```http
POST /admin/specialties
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Cardiology"
}
```

#### Study Packs

##### Get All Study Packs (Admin/Employee)

```http
GET /admin/study-packs?page=1&limit=10
Authorization: Bearer <admin_token>
```

##### Create Study Pack (Admin Only)

```http
POST /admin/study-packs
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Fourth Year Medical Studies",
  "description": "Comprehensive study pack for fourth year medical students",
  "type": "YEAR",
  "yearNumber": "FOUR",
  "price": 399.99,
  "isActive": true
}
```

### Quiz Management (Admin/Employee)

#### Get All Quizzes

```http
GET /admin/quizzes?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Create Quiz with Questions

```http
POST /admin/quizzes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Cardiovascular System Quiz",
  "description": "Comprehensive quiz on cardiovascular anatomy and physiology",
  "type": "QCM",
  "courseId": 10,
  "universityId": 24,
  "yearLevel": "THREE",
  "quizSourceId": 1,
  "quizYear": 2024,
  "questions": [
    {
      "questionText": "Which chambers of the heart receive blood?",
      "questionType": "MULTIPLE_CHOICE",
      "explanation": "The atria are the receiving chambers of the heart",
      "answers": [
        {
          "answerText": "Right atrium",
          "isCorrect": true,
          "explanation": "Receives deoxygenated blood from the body"
        },
        {
          "answerText": "Left atrium",
          "isCorrect": true,
          "explanation": "Receives oxygenated blood from the lungs"
        },
        {
          "answerText": "Right ventricle",
          "isCorrect": false,
          "explanation": "Pumps blood to the lungs"
        },
        {
          "answerText": "Left ventricle",
          "isCorrect": false,
          "explanation": "Pumps blood to the body"
        }
      ]
    }
  ]
}
```

#### Update Quiz

```http
PUT /admin/quizzes/{quizId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Quiz Title",
  "description": "Updated description"
}
```

#### Delete Quiz

```http
DELETE /admin/quizzes/{quizId}
Authorization: Bearer <admin_token>
```

### Exam Management (Admin/Employee)

#### Get All Exams

```http
GET /admin/exams?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Create Exam with Questions

```http
POST /admin/exams
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Cardiovascular System Final Exam",
  "description": "Final examination for cardiovascular system module",
  "moduleId": 21,
  "universityId": 24,
  "yearLevel": "THREE",
  "examYear": "2024 Final Exam",
  "year": 2024,
  "questions": [
    {
      "questionText": "What is the normal resting heart rate?",
      "questionType": "SINGLE_CHOICE",
      "explanation": "Normal resting heart rate for adults",
      "orderInExam": 1,
      "answers": [
        {
          "answerText": "60-100 bpm",
          "isCorrect": true,
          "explanation": "This is the normal range for healthy adults"
        },
        {
          "answerText": "40-60 bpm",
          "isCorrect": false,
          "explanation": "This is bradycardia"
        }
      ]
    }
  ]
}
```

#### Update Exam Question Order

```http
PUT /admin/exams/question-order
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "examId": 16,
  "questionOrders": [
    {
      "questionId": 123,
      "orderInExam": 1
    },
    {
      "questionId": 124,
      "orderInExam": 2
    }
  ]
}
```

### Question Management (Admin/Employee)

#### Create Question

```http
POST /admin/questions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "questionText": "What is the primary function of the heart?",
  "explanation": "The heart pumps blood throughout the body",
  "questionType": "SINGLE_CHOICE",
  "courseId": 10,
  "examId": 16,
  "universityId": 24,
  "yearLevel": "THREE",
  "examYear": 2024,
  "answers": [
    {
      "answerText": "Pumping blood",
      "isCorrect": true,
      "explanation": "Correct! The heart's primary function is circulation"
    },
    {
      "answerText": "Filtering toxins",
      "isCorrect": false,
      "explanation": "This is the function of the kidneys"
    }
  ]
}
```

#### Update Question

```http
PUT /admin/questions/{questionId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "questionText": "Updated question text",
  "explanation": "Updated explanation",
  "courseId": 15,
  "examId": 20
}
```

#### Delete Question

```http
DELETE /admin/questions/{questionId}
Authorization: Bearer <admin_token>
```

### Subscription Management (Admin Only)

#### Get All Subscriptions

```http
GET /admin/subscriptions?page=1&limit=20&status=ACTIVE
Authorization: Bearer <admin_token>
```

#### Update Subscription

```http
PUT /admin/subscriptions/{subscriptionId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "ACTIVE",
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

#### Cancel Subscription

```http
POST /admin/subscriptions/{subscriptionId}/cancel
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "User requested cancellation"
}
```

#### Add Months to Subscription

```http
POST /admin/subscriptions/{subscriptionId}/add-months
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "months": 3,
  "reason": "Promotional extension"
}
```

### Question Reports Management (Admin/Employee)

#### Get All Question Reports

```http
GET /admin/question-reports?page=1&limit=20&status=PENDING
Authorization: Bearer <admin_token>
```

#### Review Question Report

```http
PUT /admin/question-reports/{reportId}/review
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "response": "Thank you for the report. The question has been corrected.",
  "action": "RESOLVED"
}
```

**Actions:**
- `RESOLVED`: Issue has been fixed
- `DISMISSED`: Report is not valid

## Media & File Upload

The platform supports file upload and serving for various media types including images, PDFs, and study pack materials.

### File Upload Endpoints (Admin/Employee)

All upload endpoints require admin or employee authentication and use multipart/form-data.

#### Upload Images

```http
POST /admin/upload/image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- images: File[] (up to 10 image files)
```

**Supported formats:** JPG, JPEG, PNG, GIF, WebP
**Max file size:** 10MB per file
**Max files:** 10 files per request

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "heart-anatomy-1704110400000.jpg",
      "originalName": "heart-anatomy.jpg",
      "path": "/media/images/heart-anatomy-1704110400000.jpg",
      "size": 2048576,
      "mimetype": "image/jpeg"
    }
  ],
  "message": "1 image file(s) uploaded successfully"
}
```

#### Upload PDF Documents

```http
POST /admin/upload/pdf
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- pdfs: File[] (up to 10 PDF files)
```

**Supported formats:** PDF
**Max file size:** 50MB per file
**Max files:** 10 files per request

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "anatomy-textbook-1704110400000.pdf",
      "originalName": "anatomy-textbook.pdf",
      "path": "/media/pdfs/anatomy-textbook-1704110400000.pdf",
      "size": 15728640,
      "mimetype": "application/pdf"
    }
  ],
  "message": "1 PDF file(s) uploaded successfully"
}
```

#### Upload Study Pack Media

Upload mixed media for study packs (images and PDFs together).

```http
POST /admin/upload/study-pack-media
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- images: File[] (up to 15 image files)
- pdfs: File[] (up to 10 PDF files)
```

**Response:**
```json
{
  "success": true,
  "files": {
    "images": [
      {
        "filename": "diagram-1704110400000.jpg",
        "originalName": "diagram.jpg",
        "path": "/media/study-packs/diagram-1704110400000.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg"
      }
    ],
    "pdfs": [
      {
        "filename": "chapter1-1704110400000.pdf",
        "originalName": "chapter1.pdf",
        "path": "/media/study-packs/chapter1-1704110400000.pdf",
        "size": 5120000,
        "mimetype": "application/pdf"
      }
    ]
  },
  "message": "Study pack media uploaded successfully"
}
```

#### Upload Explanation Images

Upload images specifically for question explanations.

```http
POST /admin/upload/explanation
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- explanations: File[] (up to 5 image files)
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "filename": "heart-explanation-1704110400000.png",
      "originalName": "heart-explanation.png",
      "path": "/media/explanations/heart-explanation-1704110400000.png",
      "size": 512000,
      "mimetype": "image/png"
    }
  ],
  "message": "1 explanation image(s) uploaded successfully"
}
```

#### Upload Logo Images

Upload logo images for unites and organizations.

```http
POST /admin/upload/logo
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Form Data:
- logos: File[] (up to 5 logo files)
```

### File Serving Endpoints

#### Get Media File

Serve uploaded media files. No authentication required for public files.

```http
GET /media/{fileType}/{filename}
```

**File Types:**
- `images`: General images
- `pdfs`: PDF documents
- `study-packs`: Study pack materials
- `explanations`: Question explanation images
- `logos`: Logo images

**Examples:**
```http
GET /media/images/heart-anatomy-1704110400000.jpg
GET /media/pdfs/anatomy-textbook-1704110400000.pdf
GET /media/explanations/heart-explanation-1704110400000.png
```

**Response:** Binary file content with appropriate headers
- `Content-Type`: Appropriate MIME type
- `Content-Length`: File size
- `Cache-Control`: Caching headers for optimization

### File Upload Validation

#### File Size Limits
- **Images**: 10MB per file
- **PDFs**: 50MB per file
- **Logos**: 5MB per file
- **Explanations**: 10MB per file

#### File Type Restrictions
- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **PDFs**: .pdf only
- **Logos**: .jpg, .jpeg, .png, .svg
- **Explanations**: .jpg, .jpeg, .png, .gif

#### Upload Limits per Request
- **General Images**: 10 files
- **PDFs**: 10 files
- **Study Pack Images**: 15 files
- **Study Pack PDFs**: 10 files
- **Explanation Images**: 5 files
- **Logos**: 5 files

### Error Responses for File Upload

#### File Too Large
```json
{
  "success": false,
  "error": "File too large. Maximum size is 10MB"
}
```

#### Invalid File Type
```json
{
  "success": false,
  "error": "Invalid file type. Only JPG, PNG, GIF, WebP files are allowed"
}
```

#### Too Many Files
```json
{
  "success": false,
  "error": "Too many files. Maximum 10 files allowed per request"
}
```

#### No Files Uploaded
```json
{
  "success": false,
  "error": "No image files uploaded"
}
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed: title: Title must be at least 3 characters",
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters",
      "code": "too_small"
    }
  ]
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Common Error Types

1. **Authentication Errors**
   - Invalid or expired tokens
   - Missing authorization header

2. **Validation Errors**
   - Invalid request data
   - Missing required fields
   - Data type mismatches

3. **Permission Errors**
   - Insufficient role permissions
   - Access to unauthorized resources

4. **Resource Errors**
   - Resource not found
   - Resource already exists

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window:** 15 minutes
- **Limit:** 1000 requests per IP
- **Headers:** Rate limit information in response headers

## Pagination

Many endpoints support pagination using query parameters:

```http
GET /endpoint?page=1&limit=20
```

**Parameters:**
- `page`: Page number (1-1000, default: 1)
- `limit`: Items per page (1-100, default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```
